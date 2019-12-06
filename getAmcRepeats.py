import requests
import sys, json
import string
printable = set(string.printable)
from bs4 import BeautifulSoup

def main():

  #Solution by seeing if Heading is AMC 10
  # allRepeats = [[""]]*25
  # for i in range(1, 26):
  #   html_doc = requests.get("https://artofproblemsolving.com/wiki/index.php/"+sys.argv[1]+"_AMC_12"+sys.argv[2]+"_Problems/Problem_"+str(i))
  #   soup = BeautifulSoup(html_doc.text, 'html.parser')
  #   elements = soup.select('#firstHeading')
  #   if "AMC 10A" in elements[0].text:
  #       p10NumIndex = elements[0].text.index("/Problem")
  #       p10Num = elements[0].text[p10NumIndex+9:]
  #       allRepeats[int(p10Num)-1] = ["True", i]

  #Solution by looking at the tables
  allRepeats = []
  for i in range(1, 26):
    html_doc = requests.get("https://artofproblemsolving.com/wiki/index.php/"+sys.argv[1]+"_AMC_10"+sys.argv[2]+"_Problems/Problem_"+str(i))
    soup = BeautifulSoup(html_doc.text, 'html.parser')
    elements = soup.select('table')
    if len(elements)>=2:
      for table in elements:
        text = table.select('b')
        if "AMC 12" in text[0].findChild().text:
          if text[3].text[:7] == "Problem":
            allRepeats.append(["True", int(text[3].text[8:])+1])
          else:
            allRepeats.append(["True", 1])
          # print(i, allRepeats[-1])
          # print(text[3].text[:7], "\n\n\n")
          break
      else:
        # print(i, "Found at least two but failed")
        allRepeats.append([""])
    else:
      allRepeats.append([""])
      

  # Solution by seeing if redirection message is present
  # allRepeats = []
  # elements = soup.select('i')
  # for element in elements:
  #     if 'following problem is from both' in element.text:
  #         p12NumIndex = element.text.index("12"+sys.argv[2]+" #")
  #         p12Num = element.text[p12NumIndex+5: p12NumIndex+7]
  #         if (p12Num[1] not in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]):
  #             p12Num = p12Num[0]
  #         allRepeats.append(["True", p12Num])
  #         break
  # else:
  #     allRepeats.append([""])
  print(allRepeats)

if __name__ == '__main__':
    main()
