import requests
import json

def test_flask():
    url = "http://127.0.0.1:5000/api/route/calculate"
    params = {
        "from": "IDFM:monomodalStopPlace:470195",
        "to": "IDFM:monomodalStopPlace:45102"
    }
    try:
        response = requests.get(url, params=params)
        print("Status code:", response.status_code)
        data = response.json()
        print("Distance:", data.get("distance_km"))
        print("Direct transit lines:")
        for t in data.get("direct_transit", []):
            print(f"  Line {t.get('ligne')} ({t.get('type')}) - Depart: {t.get('depart')}, Arrivee: {t.get('arrivee')}, Direction: {t.get('direction')}")
    except Exception as e:
        print("Request failed:", e)

if __name__ == "__main__":
    test_flask()
