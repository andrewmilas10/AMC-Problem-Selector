import requests
import sys, json
import string
printable = set(string.printable)
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
  allSolutions = []

  for i in range(1, 26):
    html_doc = requests.get("https://artofproblemsolving.com/wiki/index.php/"+sys.argv[1]+"_AMC_12"+sys.argv[2]+"_Problems/Problem_"+str(i))
    soup = BeautifulSoup(html_doc.text, 'html.parser')
    elements = soup.select('span[id^=Solution]')

    for i in range(len(elements)-1, 0, -1):
      if elements[i].parent == elements[i-1].parent:
        del elements[i]
    solutions = []
    elementsParents = [el.parent for el in elements]
    for el in elements:
      currSol = ""
      currEl = el.parent.find_next_sibling()
      # print("currEl NEW: ", currEl, "\n\n")
      while (not currEl is None) and currEl.name != "h2" and currEl not in elementsParents:
        currSol+=str(currEl)
        currEl = currEl.find_next_sibling()
        # print("currEl: ", currEl, "\n\n")
      if (currSol != ""):
        solutions.append(currSol)
    allSolutions.append(solutions)

  allSolutionsClean = []
  for solutions in allSolutions:
    allSolutionsClean.append([])
    for text in solutions:
      allSolutionsClean[-1].append(''.join(filter(lambda x: x in printable, text)))
  print(allSolutionsClean)

if __name__ == '__main__':
    main()