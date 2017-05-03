# LSTM for sequence classification in the IMDB dataset
import numpy
from keras.datasets import imdb
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout
from keras.layers import Conv1D, MaxPooling1D, GlobalMaxPooling1D, GlobalAveragePooling1D
from keras.layers.embeddings import Embedding
from keras.preprocessing import sequence
from keras.utils.np_utils import to_categorical
from keras.optimizers import SGD
# fix random seed for reproducibility
# load the dataset but only keep the top n words, zero the rest

(X_train, y_train), (X_test, y_test) = numpy.load('../data/a_sample_c2_p1000.npy')

# y_train = numpy.array(map(lambda c: 0 if c < 5 else 1,y_train))
# y_test = numpy.array(map(lambda c: 0 if c < 5 else 1,y_test))

# truncate and pad input sequences
max_review_length = 10

y_train = to_categorical(y_train)
y_test = to_categorical(y_test)


X_train = sequence.pad_sequences(X_train, maxlen=max_review_length)
X_test = sequence.pad_sequences(X_test, maxlen=max_review_length)

tile_amount = 5
X_train = numpy.tile(X_train,tile_amount)
X_test = numpy.tile(X_test,tile_amount)
max_review_length *= tile_amount


X_train = numpy.array(map(lambda d: to_categorical(d,76), X_train))
X_test = numpy.array(map(lambda d: to_categorical(d,76), X_test))
'''
X_train = numpy.array(reduce(lambda a,b: list(a)+list(b), X_train))
X_test = numpy.array(reduce(lambda a,b: list(a)+list(b), X_test))
'''

'''
X_train = numpy.array([numpy.abs(numpy.random.randn(32))]*5000 + [numpy.abs(numpy.random.randn(32))*-1.]*5000, dtype='float32')
numpy.random.shuffle(X_train)
y_train = numpy.array([1 if X_train[i][0] > 0 else 0 for i in range(10000)])

X_test =  numpy.array([numpy.abs(numpy.random.randn(32))]*500 + [numpy.abs(numpy.random.randn(32))*-1.]*500, dtype='float32')
numpy.random.shuffle(X_test)
y_test = numpy.array([1 if X_test[i][0] > 0 else 0 for i in range(1000)])
'''

# create the model
# embedding_matrix = numpy.load('../data/me_sample_first_words.embed.50d.npy')

# print(X_test.shape)
n_trial = 1
cum_score = 0

for s in range(n_trial):
    numpy.random.seed(s)

    model = Sequential()
    '''
    # model.add(Embedding(1,64, input_length=1))
    model.add(Dense(128, activation='sigmoid', input_dim=32))
    model.add(Dense(128, activation='sigmoid'))
    #model.add(Dropout(0.2))
    model.add(Dense(1, activation='softmax'))

    sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
    model.compile(loss='mse',
                  optimizer=sgd,
                  metrics=['accuracy'])

    model.add(Embedding(37,50,
                        input_length=max_review_length
                        #,weights=[embedding_matrix],trainable=False
                        ))
    # model.add(Dense(64, activation='sigmoid', input_shape=(max_review_length,253)))
    # model.add(LSTM(64, return_sequences=True))#,input_shape=(max_review_length,253)))
    # model.add(LSTM(64, return_sequences=True))#,input_shape=(max_review_length,253)))
    '''
    model.add(LSTM(128,input_shape=(max_review_length,76)))
    # model.add(Dropout(0.1))

    model.add(Dense(2, activation='softmax'))

    '''
    model.add(Conv1D(64, 3, activation='relu', input_shape=(max_review_length, 50)))
    #model.add(Conv1D(64, 3, activation='relu'))
    model.add(MaxPooling1D(3))
    model.add(Conv1D(128, 3, activation='relu'))
    #model.add(Conv1D(128, 3, activation='relu'))
    model.add(GlobalAveragePooling1D())
    model.add(Dropout(0.5))
    model.add(Dense(10, activation='sigmoid'))
    '''

    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    print("Trial #%d" % (s+1))
    if s == 0:
        print(model.summary())

    best = (0,0)
    max_epoch = 10
    for e in range(max_epoch):
        print("* Epoch: %d/%d" % (e+1,max_epoch))
        model.fit(X_train, y_train, epochs=1, batch_size=32)
        # Final evaluation of the model
        scores = model.evaluate(X_test, y_test, verbose=0)
        # cum_score += scores[1]
        print("Test acc: %.4f" % (scores[1]))

        best = max(best, (scores[1],e+1))
    # print("")
    print("Best score is %.2f at epoch %d" % best)

# print("Overall score: %.2f%%" % (cum_score*100/n_trial))
