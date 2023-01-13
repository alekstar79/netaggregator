/**
* @fileOverview Generates "Lorem ipsum" style text.
* @author rviscomi@gmail.com Rick Viscomi, tinsley@tinsology.net Mathew Tinsley
* @see https://gist.github.com/rviscomi/1479649
* @version 1.0
*/

/**
* Produces a random number
* @return {Number} Random number
*/
export function gauss()
{
	return (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1)
}

/**
* Produces a random number with Gaussian distribution
* @param {Number} mean
* @param {Number} standard_deviation
* @return {Number}
*/
export function gaussMS(mean, standard_deviation)
{
	return Math.round(gauss() * standard_deviation + mean)
}

/**
* @class Lorem
*/
export class Lorem
{
	/**
	* Average number of words per sentence.
	* @type {Number}
	*/
	static WORDS_PER_SENTENCE_AVG = 24.460

	/**
	* Standard deviation of the number of words per sentence.
	* @type {Number}
	*/
	static WORDS_PER_SENTENCE_STD = 5.080

	/**
	* List of possible words.
	* @type {String[]}
	*/
	static WORDS = [
		'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
		'adipiscing', 'elit', 'curabitur', 'vel', 'hendrerit', 'libero',
		'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut',
		'orci', 'gravida', 'imperdiet', 'nullam', 'purus', 'lacinia',
		'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis',
		'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros',
		'dictum', 'proin', 'accumsan', 'sapien', 'nec', 'massa',
		'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus',
		'quisque', 'porttitor', 'ligula', 'dui', 'mollis', 'tempus',
		'at', 'magna', 'vestibulum', 'turpis', 'ac', 'diam',
		'tincidunt', 'id', 'condimentum', 'enim', 'sodales', 'in',
		'hac', 'habitasse', 'platea', 'dictumst', 'aenean', 'neque',
		'fusce', 'augue', 'leo', 'eget', 'semper', 'mattis',
		'tortor', 'scelerisque', 'nulla', 'interdum', 'tellus', 'malesuada',
		'rhoncus', 'porta', 'sem', 'aliquet', 'et', 'nam',
		'suspendisse', 'potenti', 'vivamus', 'luctus', 'fringilla', 'erat',
		'donec', 'justo', 'vehicula', 'ultricies', 'varius', 'ante',
		'primis', 'faucibus', 'ultrices', 'posuere', 'cubilia', 'curae',
		'etiam', 'cursus', 'aliquam', 'quam', 'dapibus', 'nisl',
		'feugiat', 'egestas', 'class', 'aptent', 'taciti', 'sociosqu',
		'ad', 'litora', 'torquent', 'per', 'conubia', 'nostra',
		'inceptos', 'himenaeos', 'phasellus', 'nibh', 'pulvinar', 'vitae',
		'urna', 'iaculis', 'lobortis', 'nisi', 'viverra', 'arcu',
		'morbi', 'pellentesque', 'metus', 'commodo', 'ut', 'facilisis',
		'felis', 'tristique', 'ullamcorper', 'placerat', 'aenean', 'convallis',
		'sollicitudin', 'integer', 'rutrum', 'duis', 'est', 'etiam',
		'bibendum', 'donec', 'pharetra', 'vulputate', 'maecenas', 'mi',
		'fermentum', 'consequat', 'suscipit', 'aliquam', 'habitant', 'senectus',
		'netus', 'fames', 'quisque', 'euismod', 'curabitur', 'lectus',
		'elementum', 'tempor', 'risus', 'cras'
	]

	/**
	* Produces a random number of commas.
	* @param {Number} word_length Number of words in the sentence.
	* @return {Number} Random number of commas
	*/
	static getRandomCommaCount(word_length)
	{
		const base = 6, average = Math.log(word_length) / Math.log(base)

		return gaussMS(average, average / base)
	}

	/**
	* Produces a random sentence length based on the average word length
	* of an English sentence.
	* @return {Number} Random sentence length
	*/
	static getRandomSentenceLength()
	{
		return gaussMS(
			Lorem.WORDS_PER_SENTENCE_AVG,
			Lorem.WORDS_PER_SENTENCE_STD
		)
	}

	/**
	* Insert commas and periods in the given sentence.
	* @param {String[]} sentence List of words in the sentence.
	* @return {String[]} Sentence with punctuation added.
	*/
	static punctuate(sentence)
	{
		let word_length, num_commas, ii, position

		word_length = sentence.length;

		/* End the sentence with a period */
		sentence[word_length - 1] += '.'

		if (word_length < 4) {
			return sentence
		}

		num_commas = Lorem.getRandomCommaCount(word_length)

		for (ii = 0; ii <= num_commas; ii++) {
			position = Math.round(ii * word_length / (num_commas + 1))

			if (position < (word_length - 1) && position > 0) {
				sentence[position] += ','
			}
		}

		/* Capitalize the first word in the sentence */
		sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1)

		return sentence
	}

	/**
	* Generate "Lorem ipsum" style words.
	* @param num_words {Number} Number of words to generate.
	* @return {String} "Lorem ipsum..."
	*/
	static get(num_words)
	{
		let words, ii, position, word, current, sentences, sentence_length, sentence

		/**
		* @default random num between 10...50
		*/
		num_words = num_words || Math.floor(Math.random() * 41) + 10
		words = [Lorem.WORDS[0], Lorem.WORDS[1]]
		num_words -= 2

		for (ii = 0; ii < num_words; ii++) {
			position = Math.floor(Math.random() * Lorem.WORDS.length)
			word = Lorem.WORDS[position]

			if (ii > 0 && words[ii - 1] === word) {
				ii -= 1;

			} else {
				words[ii] = word
			}
		}

		sentences = []
		current = 0

		while (num_words > 0) {
			sentence_length = Lorem.getRandomSentenceLength()

			if (num_words - sentence_length < 4) {
				sentence_length = num_words
			}

			num_words -= sentence_length

			sentence = []

			for (ii = current; ii < (current + sentence_length); ii++) {
				sentence.push(words[ii])
			}

			sentence = Lorem.punctuate(sentence)
			current += sentence_length
			sentences.push(sentence.join(' '))
		}

		return sentences.join(' ')
	}
}
