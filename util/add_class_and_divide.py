import sys, random, numpy

if __name__ == '__main__':
    lines = sys.stdin.readlines()
    num_classes = 2
    per_class = len(lines)/num_classes
    n_test = per_class/6
    n_train = per_class - n_test

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
        random.shuffle(class_data)
        X_train += class_data[:n_train]
        y_train += [c for i in range(n_train)]
        X_test += class_data[n_train:]
        y_test += [c for i in range(n_test)]

    random.shuffle(X_train)
    random.shuffle(y_train)
    random.shuffle(X_test)
    random.shuffle(y_test)

    X_train = numpy.array(X_train)
    y_train = numpy.array(y_train)
    X_test = numpy.array(X_test)
    y_test = numpy.array(y_test)

    numpy.save('a_sample_c2_p1000.npy', ((X_train, y_train), (X_test, y_test)))
