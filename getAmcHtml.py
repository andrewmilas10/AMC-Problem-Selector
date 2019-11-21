import requests
import sys, json
from bs4 import BeautifulSoup

def main():
  # print(sys.argv[1], sys.argv[2])
  html_doc = requests.get("https://artofproblemsolving.com/wiki/index.php/"+sys.argv[1]+"_AMC_12"+sys.argv[2]+"_Problems")
  # html_doc = requests.get("https://artofproblemsolving.com/wiki/index.php/2019_AMC_12B_Problems")
  print("<h1>"+sys.argv[1]+" AMC "+sys.argv[2]+"</h1>")
  soup = BeautifulSoup(html_doc.text, 'html.parser')
  elements = soup.find_all("h2")
  for el in elements:
    if (el.find_next_sibling() != None and el.find_next_sibling().name == "p"):
      print("<h2>Problem "+str(elements.index(el))+"</h2>")
      elCopy = el.find_next_sibling()
      html = ""
      while(elCopy.find_next_sibling().name != "h2"):
        html+=str(elCopy)
        elCopy = elCopy.find_next_sibling()
      print(html)
      # print(str(el.find_next_sibling()))

if __name__ == '__main__':
    main()




