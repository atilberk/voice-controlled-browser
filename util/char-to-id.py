import sys, os
import numpy as np

def preprocess(data):
    '''
    Convert each line string to a list of non-empty strings
    where each element is a token (words)
    '''
    print "Preprocessing data..."
    return map(
        lambda line: map(
            lambda token: token.strip(),
            list(line.strip())[::-1]
        ),
        data
    )

def flatten(twod_list):
    '''
    Convert the 2D-list into a 1D-list
    '''
    return reduce(lambda l1,l2: l1+l2, twod_list, [])

def build_dictionaty(data):
    '''
    Construct a dictionary out of the tokens in the data where each distinct
    token in the data has a unique integer starting from 1
    '''
    print "Building a dictionary..."
    dictionary = {}
    i = 1
    for token in flatten(data):
        if token not in dictionary:
            dictionary[token] = i
            i += 1
    return (i,dictionary)

def translate(data, dictionary):
    '''
    Convert the the list of lists of tokens
    into the list of lists of ids in the dictionary
    '''
    print "Translating words into indices..."
    return map(
        lambda sentence: map(
            lambda token: dictionary[token],
            sentence
        ),
        data
    )

def lineify_data(data):
    return map(
            lambda instance: " ".join(
                map(str,instance)
            ),
            data
        )

def stringify_dict(dictionary):
    return "\n".join(
        map(
            lambda (token,id): token + " " + str(id),
            dictionary.items()
        )
    )

def split_data(lines):
    print "Splitting data into train and test sets"
    num_classes = 10
    per_class = len(lines)/num_classes
    n_test = per_class/6
    n_train = per_class - n_test

    print "total, num_classes, per_class, n_train, n_test"
    print len(lines), num_classes, per_class, n_train, n_test

    classes = [[] for i in range(num_classes)]

    for i in range(len(lines)):
        instance = lines[i].strip()
        c = i/per_class
        classes[c].append(map(int,instance.split()))

    X_train = []
    y_train = []
    X_test = []
    y_test = []

    for c in range(num_classes):
        class_data = classes[c]
        np.random.shuffle(class_data)
        X_train += class_data[:n_train]
        y_train += [c for i in range(n_train)]
        X_test += class_data[n_train:]
        y_test += [c for i in range(n_test)]

    np.random.shuffle(X_train)
    np.random.shuffle(y_train)
    np.random.shuffle(X_test)
    np.random.shuffle(y_test)

    X_train = np.array(X_train)
    y_train = np.array(y_train)
    X_test = np.array(X_test)
    y_test = np.array(y_test)

    np.save('me_sample_sentences.char.npy', ((X_train, y_train), (X_test, y_test)))
    print "Saved to 'me_sample_sentences.char.npy'"

if __name__ == '__main__':
    raw_data = sys.stdin.readlines()
    data = preprocess(raw_data)
    (num_token, dictionary) = build_dictionaty(data)
    print "Found %d distinct tokens" % num_token

    target = translate(data, dictionary)
    lines = lineify_data(target)
    split_data(lines)
