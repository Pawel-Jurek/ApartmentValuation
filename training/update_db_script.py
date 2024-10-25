import requests
from bs4 import BeautifulSoup
import datetime
from valuation.models import Apartment
import os

neighborhoods = {
    "Kraków": [
        'Stare Miasto', 'Grzegórzki', 'Prądnik Czerwony', 'Prądnik Biały', 'Krowodrza', 
        'Bronowice', 'Zwierzyniec', 'Dębniki', 'Łagiewniki-Borek Fałęcki', 'Swoszowice', 
        'Podgórze Duchackie', 'Bieżanów-Prokocim', 'Podgórze', 'Czyżyny', 'Mistrzejowice', 
        'Bieńczyce', 'Wzgórza Krzesławickie', 'Nowa Huta'
    ],
    "Warszawa": [
        'Bemowo', 'Białołęka', 'Bielany', 'Mokotów', 'Ochota', 'Praga-Południe', 
        'Praga-Północ', 'Rembertów', 'Śródmieście', 'Targówek', 'Ursus', 'Ursynów', 
        'Wawer', 'Wesoła', 'Wilanów', 'Włochy', 'Wola', 'Żoliborz'
    ],
    "Poznań": [
        'Stare Miasto', 'Nowe Miasto', 'Wilda', 'Grunwald', 'Jeżyce'
    ]
}


def log_error_to_file(offer_url, error_message):
 
    error_folder = "training/errors"
    os.makedirs(error_folder, exist_ok=True)
    
    error_file = os.path.join(error_folder, "scraping_errors.txt")
    
    with open(error_file, "a", encoding="utf-8") as f:
        f.write(f"{offer_url}\n{error_message}\n{'-'*12}\n")


def get_page_content(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching page content from {url}: {e}")
        return None


def get_data_from_text(details, first, second):
    try:
        first_pos = details.text.find(first) + len(first)
        second_pos = details.text[first_pos:].find(second) + first_pos
        return details.text[first_pos: second_pos].replace(" ", "").replace('\xa0', '')
    except Exception as e:
        print(f"Error extracting data from text: {e}")
        return None


def parse_apartments(html, city, year):
    if not html:
        print(f"No HTML content to parse for city: {city}, year: {year}")
        return []

    soup = BeautifulSoup(html, 'html.parser')
    apartments = []
    listing_elements = soup.select('ul.css-rqwdxd li article[data-cy="listing-item"]')
    
    for element in listing_elements:
        try:
            price = element.select_one('span.evk7nst0')
            address = element.select_one('p.eejmx80')
            details = element.select_one('div.css-1c1kq07')
            link_element = element.select_one('a')
        
            if not link_element or not price or not address or not details:
                continue

            price = price.text.replace('\xa0', '').replace('zł', '').replace(',', '.').replace(' ', '')
            district = address.text.split(", ")[-3]
            floor = get_data_from_text(details, "Piętro", "piętro")
            rooms = get_data_from_text(details, "pokoi", "poko")
            sq = get_data_from_text(details, "Powierzchnia", "m")
            price_per_sq = get_data_from_text(details, "kwadratowy", "zł")
            offer_url = "https://www.otodom.pl" + link_element['href']

            apartment = {
                'district': district if district in neighborhoods[city] else None,
                'city': city,
                'floor': int(floor) if floor and floor.isdigit() else 0,
                'price': float(price) if price else 0,
                'rooms': int(rooms) if rooms and rooms.isdigit() else 1,
                'sq': float(sq) if sq else 0,
                'price_per_sq': float(price_per_sq) if price_per_sq else 0,
                'year': year,
                'offer_url': offer_url
            }
            apartments.append(apartment)

        except Exception as e:
            error_message = f"Error parsing apartment: {e}"
            log_error_to_file(offer_url if 'offer_url' in locals() else 'Unknown URL', error_message)

    return apartments


def validate_apartment_data(data):
    required_fields = ['district', 'city', 'price', 'rooms', 'sq', 'price_per_sq', 'offer_url']
    for field in required_fields:
        if not data.get(field):
            error_message = f"Invalid data, missing {field}"
            log_error_to_file(data.get('offer_url', 'Unknown URL'), error_message)
            return False
    return True


def import_apartments_to_db(apartments):
    for data in apartments:
        if not validate_apartment_data(data):
            continue

        try:
            existing_apartment = Apartment.objects.get(
                offer_url=data['offer_url'], 
                update_date=datetime.date.today()
            )
            if existing_apartment.price != data['price'] or existing_apartment.price_per_sq != data['price_per_sq']:
                existing_apartment.price = data['price']
                existing_apartment.price_per_sq = data['price_per_sq']
                existing_apartment.save()

        except Apartment.DoesNotExist:
            try:
                Apartment.objects.create(
                    district=data['district'],
                    city=data['city'],
                    floor=data['floor'],
                    price=data['price'],
                    rooms=data['rooms'],
                    sq=data['sq'],
                    year=data['year'],
                    price_per_sq=data['price_per_sq'],
                    update_date=datetime.date.today(),
                    offer_url=data['offer_url']
                )
            except Exception as e:
                error_message = f"Error saving new apartment to database: {e}"
                log_error_to_file(data.get('offer_url', 'Unknown URL'), error_message)


def get_total_pages(html):
    if not html:
        return 1
    try:
        soup = BeautifulSoup(html, 'html.parser')
        pagination = soup.select('ul[data-cy="frontend.search.base-pagination.nexus-pagination"] li')
        if pagination:
            page_numbers = [int(li.text) for li in pagination if li.text.isdigit()]
            return max(page_numbers) if page_numbers else 1
    except Exception as e:
        print(f"Error finding total pages: {e}")
    return 1


def scrape_apartments(base_url, years):
    for year in years:
        page = 1
        try:
            first_page_html = get_page_content(f"{base_url[1]}&buildYearMin={year}&buildYearMax={year}&page=1")
            total_pages = get_total_pages(first_page_html)
            print(f"Scraping {base_url[0]}, year: {year}. Total pages: {total_pages}")
            for page in range(1, total_pages + 1):
                url = f"{base_url[1]}&buildYearMin={year}&buildYearMax={year}&page={page}"
                html = get_page_content(url)
                apartments = parse_apartments(html, base_url[0], year)
                if apartments:
                    import_apartments_to_db(apartments)
                else:
                    break
        except Exception as e:
            error_message = f"Error while scraping apartments for year {year}, page {page}: {e}"
            log_error_to_file(base_url[0], error_message)



def import_apartments():
    base_urls = [
        ["Poznań", "https://www.otodom.pl/pl/wyniki/sprzedaz/mieszkanie/wielkopolskie/poznan/poznan/poznan?limit=72&ownerTypeSingleSelect=ALL&by=DEFAULT&direction=DESC&viewType=listing"],
        ["Kraków", "https://www.otodom.pl/pl/wyniki/sprzedaz/mieszkanie/malopolskie/krakow/krakow/krakow?limit=72&ownerTypeSingleSelect=ALL&by=DEFAULT&direction=DESC&viewType=listing"],
        ["Warszawa", "https://www.otodom.pl/pl/wyniki/sprzedaz/mieszkanie/mazowieckie/warszawa/warszawa/warszawa?limit=72&ownerTypeSingleSelect=ALL&by=DEFAULT&direction=DESC&viewType=listing"]
    ]

    current_year = datetime.datetime.now().year
    years = list(range(2024, current_year + 1))

    try:
        for base_url in base_urls[2:]:
            scrape_apartments(base_url, years)
        return ['success']
    except Exception as e:
        print(f'Error during scraping process: {e}')
        return ['failure', e]
