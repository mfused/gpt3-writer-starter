import { Configuration, OpenAIApi } from 'openai';

const maxWordsPerPrompt = 2000;
const maxRequests = 5;

const generateAction = async (req, res) => {
	console.log('req.body', req.body);
	const { openAIApiKey, podcastTitle, episodeTitle, transcript } = req.body;

	if (!openAIApiKey || openAIApiKey === '' || !podcastTitle || podcastTitle === '' || !transcript || transcript === '') {
		console.log('throw error');
		return res.status(400).json({ error: 'Missing required fields' });
	}

	const configuration = new Configuration({
		apiKey: openAIApiKey
	});

	const openai = new OpenAIApi(configuration);

	const promptChain = [];

	const wordArray = transcript.trim().split(/\s+/);
	const wordArrayLength = wordArray.length;
	if (wordArrayLength > maxWordsPerPrompt) {
		for (let i = 0; i < wordArrayLength / maxWordsPerPrompt; i++) {
			const transcriptArray = wordArray.slice(i * maxWordsPerPrompt, (i + 1) * maxWordsPerPrompt - 1);
			const prompt = `Create a story based on words said about color.
      Podcast Title: ${podcastTitle} - ${episodeTitle}
      Podcast Transcript: ${transcriptArray.join(' ')}
      Summary:`;
			promptChain.push(prompt);
		}
	} else {
		const basePrompt = `Create a story based on words said about color.
    Podcast Title: ${podcastTitle} - ${episodeTitle}
    Podcast Transcript: ${transcript}
    Summary:`;
		promptChain.push(basePrompt);
	}

	console.log(
		'promptChain: ',
		promptChain.slice(0, maxRequests).map((_prompt) => _prompt.slice(0, 2000))
	);

	// Chained Requests
	const promptOutputs = [];
	await Promise.all(
		promptChain.map(async (prompt, index) => {
			if (index >= maxRequests - 1) return;
			const baseCompletion = await openai.createCompletion({
				model: 'text-davinci-003',
				prompt,
				temperature: 0.7,
				max_tokens: 250
			});
			const output = baseCompletion.data.choices.pop();
			promptOutputs.push(output);
		})
	);
	let basePromptOutput = promptOutputs[0];

	console.log('promptOutputs: ', promptOutputs);

	// If chained, request a full summary
	if (promptOutputs.length > 1) {
		const prompt = `Create a story based on the podcast description.
    Podcast Title: ${podcastTitle} - ${episodeTitle}
    Podcast Description: ${promptOutputs.map((promptOutput) => `\n${promptOutput.text}`)}
    Summary:`;
		console.log('prompt', prompt);
		const baseCompletion = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt,
			temperature: 0.7,
			max_tokens: 500
		});
		basePromptOutput = baseCompletion.data.choices.pop();
	}

	console.log('basePromptOutput: ', basePromptOutput);
	res.status(200).json({ output: basePromptOutput });
};

export default generateAction;
