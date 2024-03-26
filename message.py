import unittest
class Message:
    def __init__(self, sender, content):
        self.sender = sender
        self.content = content

    def validate(self):
        if not self.sender or not self.content:
            raise ValueError("Sender and content cannot be empty")

    def send_message(self):
        #returning the message as a string
        return f"{self.sender} : {self.content}"

class TestMessage(unittest.TestCase):
    def test_message_validation(self):
        message = Message("Sanjana", "")
        with self.assertRaises(ValueError):
            message.validate()
    
    def test_send_message(self):
        message = Message("Sanjana" , "Testing of Message Functionality")
        self.assertEqual(message.send_message(), "Sanjana : Testing of Message Functionality")
        print(message.send_message())

if __name__=='_main_':
    unittest.main()