import requests
import sys, json
import string
printable = set(string.printable)
from bs4 import BeautifulSoup

def main():
  allRepeats = []

  for i in range(1, 26):
    html_doc = requests.get("https://artofproblemsolving.com/wiki/index.php/"+sys.argv[1]+"_AMC_10"+sys.argv[2]+"_Problems/Problem_"+str(i))
    soup = BeautifulSoup(html_doc.text, 'html.parser')
    elements = soup.select('i')
    for element in elements:
        if 'following problem is from both' in element.text:
            allRepeats.append(True)
            break
    else:
        allRepeats.append(False)
  print(allRepeats)

if __name__ == '__main__':
    main()
