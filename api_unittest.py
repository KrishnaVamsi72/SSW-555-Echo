import unittest
import requests

class TestApi(unittest.TestCase):
    user = 'Sanjana'

    def setUp(self):
        #defining API Endpoint 
        self.api = "https://google.com/users"

    def get_user(self):
        #send GET Request to the API Endpoint
        response = requests.get(self.api)
        print('Response Code', response.status_code)
    #assert the response status is 200 
        self.assertEqual(response.status_code,200)
        