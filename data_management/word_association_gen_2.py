import json
from pprint import pprint

words = {
    0: ("apple", "pear", "plum", "banana", "tomato", "grape", "beet", "orange", "lemon", "carrot"),
    1: ("dog", "cat", "mouse", "fox", "horse", "cow", "chicken", "pig", "squirrel", "rabbit"),
    2: ("house", "forest", "quite", "fire", "night", "morning", "rain", "library", "riot", "sleep"),
    3: ("book", "hand", "hold", "man", "bag", "fire", "foot", "back", "wood", "over"), 
    4: ("redefine", "demean", "stark", "disembark", "sunshine", "submarine", "remark", "dine", "reen"),
    5: ("dynamic", "hypnosis", "sated", "hydrated", "ceramic", "psychosis", "dictated", "hammock", "doses"),
    6: ("pet", "remake", "apprise", "asset", "rise", "ache", "pint-sized", "roulette", "partake"),
}

data = {}

for i in words.keys():
    word_range = range(len(words[i]))
    word_dict = {}
    for j in word_range: 
        word = words[i][j]
        word_dict[word] = [w for w in words[i] if w != word]
    data[i] = word_dict

output = {}
output['words'] = data

with open('wordmappings.json', 'w') as outfile:
    json.dump(output, outfile, indent = 4)

