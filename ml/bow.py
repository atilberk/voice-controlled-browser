from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier

f = open("../data/me_sample_sentences.txt",'r')
s = [l.strip() for l in f.readlines()]
f.close()

vectorizer = CountVectorizer(analyzer = "word",   \
                             tokenizer = None,    \
                             preprocessor = None, \
                             stop_words = None,   \
                             max_features = 5000)

tdf = vectorizer.fit_transform(s)
tdf = tdf.toarray()

forest = RandomForestClassifier(n_estimators = 100)
forest = forest.fit( tdf, [int(i/30) for i in range(len(s))] )

classes = [
    "refresh",
    "open",
    "close",
    "switch",
    "history",
    "go-to",
    "scroll",
    "click",
    "type",
    "read"
]

while True:
    cmd = input("cmd: ")
    if cmd == "exit":
        break
    tf = vectorizer.transform([cmd]).toarray()
    result = forest.predict(tf)
    print("Result is "+ classes[int(result[0])] + str(result))
