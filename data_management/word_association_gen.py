import json
from pprint import pprint
import random
with open('wordmappings.json', 'r') as word_mappings:
    data = json.load(word_mappings)

stored_words = data['words']
word_set = set()
for stored_word in stored_words:
    word_set.add(stored_word)
    for mapped_word in stored_words[stored_word]:
        word_set.add(mapped_word)
for word in word_set:
    if word not in stored_words:
        stored_words[word] = []
for word in word_set:
    if len(stored_words[word]) < 9:
        while len(stored_words[word]) < 9:
            random_word = random.sample(word_set, 1)[0]
            if random_word not in stored_words[word] and word != random_word:
                stored_words[word].append(random_word)


with open('wordmappings.json', 'w') as word_mappings:
    json.dump(data, word_mappings)
