import requests
import json
import os

# Define the path to the JSON file
json_file_path = 'quotes.json'

# Function to load existing quotes from the JSON file
def load_existing_quotes():
    if os.path.exists(json_file_path):
        with open(json_file_path, 'r', encoding='utf-8') as file:
            return {quote['quote'] for quote in json.load(file)}
    return set()

# Function to save new quotes to the JSON file
def save_quotes(quotes):
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(quotes, file, ensure_ascii=False, indent=4)

# Function to fetch new quotes from the ZenQuotes API
def fetch_new_quotes():
    url = 'https://zenquotes.io/api/quotes'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch quotes: {response.status_code}")
        return []

# Main function to update the JSON file with new quotes
def update_quotes():
    existing_quotes = load_existing_quotes()
    new_quotes = fetch_new_quotes()
    
    # Filter out quotes that are already in the existing set
    unique_new_quotes = [
        {"quote": quote['q'], "author": quote['a']}
        for quote in new_quotes
        if quote['q'] not in existing_quotes
    ]
    
    if unique_new_quotes:
        # Load existing data and append new unique quotes
        all_quotes = []
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r', encoding='utf-8') as file:
                all_quotes = json.load(file)
        all_quotes.extend(unique_new_quotes)
        
        # Save the updated list back to the JSON file
        save_quotes(all_quotes)
        print(f"Added {len(unique_new_quotes)} new quotes.")
    else:
        print("No new unique quotes to add.")

if __name__ == '__main__':
    update_quotes()
