import sys

def preprocess(data):
    '''
    Convert each line string to a list of non-empty strings
    where each element is a token (words)
    '''
    return map(
        lambda line: filter(
            lambda token: len(token),
            map(
                lambda token: token.strip(),
                line.strip().split()
            )
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
    dictionary = {}
    i = 0
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
    return map(
        lambda sentence: map(
            lambda token: dictionary[token],
            sentence
        ),
        data
    )

def stringify_data(data):
    return "\n".join(
        map(
            lambda instance: " ".join(
                map(str,instance)
            ),
            data
        )
    )

def stringify_dict(dictionary):
    return "\n".join(
        map(
            lambda (token,id): token + " " + str(id),
            dictionary.items()
        )
    )

if __name__ == '__main__':
    raw_data = sys.stdin.readlines()
    data = preprocess(raw_data)
    (num_token, dictionary) = build_dictionaty(data)
    target = translate(data, dictionary)
    output = stringify_data(target)
    print num_token
    print stringify_dict(dictionary)
    print output
    sys.stdout.flush()
