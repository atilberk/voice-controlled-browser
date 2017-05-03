# LSTM for sequence classification in the IMDB dataset
import numpy
from keras.datasets import imdb
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout
from keras.layers.embeddings import Embedding
from keras.preprocessing import sequence
from keras.utils.np_utils import to_categorical
# fix random seed for reproducibility
numpy.random.seed(7)
# load the dataset but only keep the top n words, zero the rest
top_words = 253
# (X_train, y_train), (X_test, y_test) = imdb.load_data(num_words=top_words)
# (X_train, y_train), (X_test, y_test) = numpy.load('imdb_data_1000.npy')
(X_train, y_train), (X_test, y_test) = numpy.load('../data/me_sample_first_words.npy')

y_train = numpy.array(map(lambda c: 0 if c < 5 else 1,y_train))
y_test = numpy.array(map(lambda c: 0 if c < 5 else 1,y_test))

# X_train = X_train[:500]
# y_train = y_train[:500]
# X_test = X_test[:100]
# y_test = y_test[:100]

# y_train = to_categorical(y_train)
# y_test = to_categorical(y_test)
# truncate and pad input sequences
max_review_length = 1
X_train = sequence.pad_sequences(X_train, maxlen=max_review_length)
X_test = sequence.pad_sequences(X_test, maxlen=max_review_length)
# create the model
embedding_vecor_length = 32
model = Sequential()
model.add(Embedding(top_words, embedding_vecor_length, input_length=max_review_length))
model.add(LSTM(100))
model.add(Dropout(0.5))
model.add(Dense(1, activation='sigmoid'))
# model.add(Dense(10, activation='sigmoid'))
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
# model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
print(model.summary())
model.fit(X_train, y_train, epochs=10, batch_size=16)
# Final evaluation of the model
scores = model.evaluate(X_test, y_test, verbose=0)
print("Accuracy: %.2f%%" % (scores[1]*100))
