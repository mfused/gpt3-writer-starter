import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
	const [openAIApiKey, setOpenAIApiKey] = useState('');
	const [podcastTitle, setPodcastTitle] = useState('');
	const [episodeTitle, setEpisodeTitle] = useState('');
	const [transcript, setTranscript] = useState('');
	const [apiOutput, setApiOutput] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState(false);
	const outputRef = useRef(null);

	const callGenerateEndpoint = async () => {
		try {
			setIsGenerating(true);

			console.log('Calling OpenAI...');
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ openAIApiKey, podcastTitle, episodeTitle, transcript })
			});

			const data = await response.json();
			const { error, output } = data;
			if (error || !output || response.status === 400) {
				if (error) setError(error);
				else setError('Something went wrong');
				setIsGenerating(false);
				return;
			}
			console.log('OpenAI replied...', output.text);
			setError('');
			setApiOutput(`${output.text}`);
			setIsGenerating(false);
		} catch (error) {
			setError('Something went wrong. Perhaps the OpenAI API key is invalid?');
			setIsGenerating(false);
		}
	};

	const handleOpenAIApiKeyChange = (event) => {
		setOpenAIApiKey(event.target.value);
	};

	const handlePodcastTitleChange = (event) => {
		setPodcastTitle(event.target.value);
	};

	const handlePodcastEpisodeTitleChange = (event) => {
		setEpisodeTitle(event.target.value);
	};

	const handlePodcastTranscriptChange = (event) => {
		setTranscript(event.target.value);
	};

	const totalWords = transcript.split(' ').length;

	useEffect(() => {
		if (apiOutput && outputRef.current) {
			outputRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [apiOutput, outputRef]);

	return (
		<div className='root'>
			<Head>
				<title>GPT-3 Writer | buildspace</title>
			</Head>
			<div className='container'>
				<div className='header'>
					<div className='header-title'>
						<h1>Stories about the colors</h1>
					</div>
					<div className='header-subtitle'>
						<h2>Tell us few words about your favorite color and generate a story about it.</h2>
					</div>
				</div>
				<div className='prompt-container'>
					<div className='header-subtitle'>
						<h2>Open AI API Key</h2>
					</div>
					<input
						className='prompt-input'
						placeholder='Enter in your own OpenAI API Key'
						value={openAIApiKey}
						onChange={handleOpenAIApiKeyChange}
					/>
					
				</div>
				<div className='prompt-container'>
					<div className='header-subtitle'>
						<h2>Story Details</h2>
					</div>
					<input
						className='prompt-input'
						placeholder='Enter in your name'
						value={podcastTitle}
						onChange={handlePodcastTitleChange}
					/>
					<input
						className='prompt-input'
						placeholder='Enter in the name of your favorite color'
						value={episodeTitle}
						onChange={handlePodcastEpisodeTitleChange}
					/>
					<textarea
						className='prompt-box'
						placeholder='Write in few words what do you like about that color'
						value={transcript}
						onChange={handlePodcastTranscriptChange}
					/>
					{transcript && (
						<div className='prompt-buttons'>
							<span className='prompt-length'>{totalWords} words</span>
						</div>
					)}
					{error && <div className='error'>Error: {error}</div>}
					<div className='prompt-buttons'>
						<a className={isGenerating ? 'generate-button loading' : 'generate-button'} onClick={callGenerateEndpoint}>
							<div className='generate'>{isGenerating ? <span className='loader'></span> : <p>Generate</p>}</div>
						</a>
					</div>
				</div>
			</div>
			{apiOutput && (
				<div className='output' ref={outputRef}>
					<div className='output-header-container'>
						<div className='output-header'>
							<h2>Story about the color:</h2>
						<div className='output-content'>
						<p>{apiOutput}</p>
					</div>
							
						</div>
					</div>
					
				</div>
			)}
			<div className='container'>
			
			</div>
			<div className='badge-container grow'>
				<a href='https://buildspace.so/builds/ai-writer' target='_blank' rel='noreferrer'>
					<div className='badge'>
						<Image src={buildspaceLogo} alt='buildspace logo' />
						<p>build with buildspace</p>
					</div>
				</a>
			</div>
		</div>
	);
};

export default Home;
