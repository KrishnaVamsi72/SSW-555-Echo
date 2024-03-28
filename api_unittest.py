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

    def test_get_response(self):
        response = requests.get(self.api)
        #assert that the response content is json
        self.assertEqual(response.headers.get('Content-Type'), 'application/json')

    #assert that user has expected fields 
        user = {
            "id" : 1,
            "name" : "Sanjana",
            "email" : "Sanajana@stevens.com"
        }
        self.assertDicEqual(user,{
            "id":1,
            "name" : "Sanjana",
            "email" : "Sanjana@stevens.com"
         })
        print('user Details', user)

if __name__  =='__main__':
    unittest.main()