import requests
import sys, json
from bs4 import BeautifulSoup

def find_nth(haystack, needle, n):
    start = haystack.find(needle)
    while start >= 0 and n > 1:
        start = haystack.find(needle, start+len(needle))
        n -= 1
    return start

def replaceImgsWithLatex(question):
  while "<img" in question:
    rightIndex = question.find("/>") if (question.find("/>")>0 and (question.find("/>") < question.find("/img>") or question.find("/img>") == -1)) else question.find("/img>")
    img = question[question.index("<img"):rightIndex+2]
    alt = img[img.index("\"")+1:find_nth(img, "\"", 2)]
    # print("indices: ", question.index("\""), find_nth(img, "\"", 2))
    # print("alt: ",alt)
    question = question.replace(img, alt)
  return(question.replace("<p>", "").replace("</p>", ""))

def main():
  html_doc = requests.get("https://artofproblemsolving.com/wiki/index.php/"+sys.argv[1]+"_AMC_12"+sys.argv[2]+"_Problems")
  soup = BeautifulSoup(html_doc.text, 'html.parser')
  elements = soup.find_all("h2")
  questions = []
  for el in elements:
    if (el.find_next_sibling() != None and el.find_next_sibling().name == "p"):
      elCopy = el.find_next_sibling()
      html = ""
      cleanedQuestion = replaceImgsWithLatex(str(el.find_next_sibling()))
      while(elCopy.find_next_sibling().name != "h2"):
        html+=str(elCopy)
        elCopy = elCopy.find_next_sibling()
      questions.append([html, cleanedQuestion])

  print(questions)

  # print ("\n NEXT SIBLING: \n", replaceImgsWithLatex(str(elements[0].find_next_sibling())))
  # print ("\n NEXT SIBLING: \n", replaceImgsWithLatex(str(elements[1].find_next_sibling())))
  # print ("\n NEXT SIBLING: \n", replaceImgsWithLatex(str(elements[2].find_next_sibling())))

if __name__ == '__main__':
    main()




