#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# https://colab.research.google.com/drive/1ZvMA_03MQmRG7HFtIujwrLwsGkm1PcXT?usp=sharing#scrollTo=mcs9t42UvXUW
# https://colab.research.google.com/drive/1S3CMmXwOgqRI_-FCsYSTiEOeAdNLQkRz#scrollTo=Oinoaw9Fdcv0

# useful links
# see https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html
# see https://www.machinelearningmastery.ru/save-load-machine-learning-models-python-scikit-learn
# see https://github.com/python-telegram-bot/python-telegram-bot
# see https://habr.com/ru/company/ods/blog/323890
# see https://www.nltk.org

import nltk
import json
import random
import pickle
import string
import requests

import matplotlib.pyplot as plt

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC, LinearSVC

from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
from netxcfg import token

# CONFIG_STRUCT = {
#     'intents': {
#         'hello': {
#             'examples': ['Привет', 'Добрый день', 'Здравствуйте'],
#             'responses': ['Привет, человек', 'Доброго времени суток']
#         }
#     },
#     'failure_phrases': [
#         'Я ничего не понял',
#         'Я всего лишь бот, сформулируйте попроще'
#     ]
# }


def test_perform(_classifier, _vectorizer, matrice=None):
    for phrase in ['чем ты там вообще занят', 'чем ты там вообще занимаешься', 'ты там че делаешь то']:
        transform = _vectorizer.transform([phrase])

        print(_classifier.predict(transform))
        print(list(transform.nonzero()[1]))

    try:
        xtrain, xtest, ytrain, ytest = matrice
        print('train', _classifier.score(xtrain, ytrain))
        print('test', _classifier.score(xtest, ytest))
    except (ValueError, TypeError):
        pass


def text_adduction(text):
    text = text.lower()
    text = [c for c in text if c in 'abcdefghijklmnopqrstuvwxyzабвгджзеёийклмнопрстуфхцчшщьыъэюя -']
    return ''.join(text)


def draw(axis_x, axis_y, title):
    fig, ax = plt.subplots()
    fig.suptitle(title)
    ax.plot(axis_x, axis_y)
    plt.show()


# NGRAMS = [(1, 1), (1, 2), (1, 3), (1, 4), (2, 2), (2, 3), (2, 4), (3, 3), (3, 4), (4, 4)]
# SCORES = []

BOT_CONFIG = json.load(open('bot_config.json', 'r'))
X_examples = []
Y = []

url = 'https://raw.githubusercontent.com/vladislavneon/RuBQ/master/RuBQ_1.0/RuBQ_1.0_dev.json'
response = requests.get(url).json()

for external in response:
    sid = ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))

    BOT_CONFIG['intents'][sid] = {
        'examples': [external['question_text']],
        'responses': [external['answer_text']]
    }


for intent, data in BOT_CONFIG['intents'].items():
    for example in data['examples']:
        filtered = text_adduction(example)

        if len(filtered) < 1:
            continue

        X_examples.append(example)
        Y.append(intent)

vectorizer: CountVectorizer or TfidfVectorizer

# vectorizer = CountVectorizer()
vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 4))

# classifier = RandomForestClassifier(n_estimators=50, criterion='gini')
# classifier = AdaBoostClassifier(n_estimators=100)
# classifier = DecisionTreeClassifier()
# classifier = KNeighborsClassifier()
# classifier = MLPClassifier(random_state=1, max_iter=300)
# classifier = LogisticRegression()
# classifier = SVC(kernel='linear', gamma=2, C=1)
classifier = LinearSVC(penalty='l2')

X = vectorizer.fit_transform(X_examples)
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.33)
classifier.fit(X_train, Y_train)

# Tests
# test_perform(classifier, vectorizer, [X_train, X_test, Y_train, Y_test])

# for ngram_range in NGRAMS:
#     vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=ngram_range)
#     X = vectorizer.fit_transform(X_examples)
#     classifier.fit(X, Y)
#
#     SCORES.append(classifier.score(X, Y) * 100)
#
# draw(NGRAMS, SCORES, 'LinearSVC: graph of the model quality from size ngram')

pickle.dump(vectorizer, open('tfidf_vectorizer.pickle', 'wb'))
pickle.dump(classifier, open('lsvc-classifier.pickle', 'wb'))


def match(text, sample):
    try:
        distance = nltk.edit_distance(text, sample) / len(sample)
        if distance < 0.4:
            return True
    except ZeroDivisionError:
        pass

    return False


def get_direct_intent(text):
    text = text_adduction(text)

    for intent_id, item in BOT_CONFIG['intents'].items():
        for sample in item['examples']:
            sample = text_adduction(sample)

            if match(text, sample):
                return intent_id


def get_intent_predictive_model(text):
    return classifier.predict(vectorizer.transform([text]))[0]


def get_answer_by_intent(intent_id):
    return random.choice(BOT_CONFIG['intents'][intent_id]['responses'])


def bot(text):
    # intent_id = get_direct_intent(text)

    # if not intent:
    intent_id = get_intent_predictive_model(text)

    if intent_id:
        return get_answer_by_intent(intent_id)

    return random.choice(BOT_CONFIG['failure_phrases'])


# question = ''
# while question not in ['выход', 'exit']:
#     question = input()
#     print(bot(question))


def start(update: Update) -> None:
    """Send a message when the command /start is issued."""
    update.message.reply_text('Hi!')


def help_command(update: Update) -> None:
    """Send a message when the command /help is issued."""
    update.message.reply_text('I\'m very intellegent AI creature!')


def echo(update: Update) -> None:
    """Reply to a user's message."""
    answer = bot(update.message.text)
    update.message.reply_text(answer)


def main():
    # Create the Updater and pass it your bot's token.
    # Make sure to set use_context=True to use the new context based callbacks
    # Post version 12 this will no longer be necessary
    updater = Updater(token=token, use_context=True)

    # Get the dispatcher to register handlers
    dispatcher = updater.dispatcher

    # on different commands - answer in Telegram
    dispatcher.add_handler(CommandHandler('start', start))
    dispatcher.add_handler(CommandHandler('help', help_command))

    # on noncommand i.e. message - echo the message on Telegram
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, echo))

    # Start the Bot
    updater.start_polling()

    # Run the bot until you press Ctrl-C or the process receives SIGINT,
    # SIGTERM or SIGABRT. This should be used most of the time, since
    # start_polling() is non-blocking and will stop the bot gracefully.
    updater.idle()
