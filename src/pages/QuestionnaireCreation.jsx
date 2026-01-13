import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, X, CheckCircle, AlertCircle, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import IconSelector from '@/components/IconSelector';

const QuestionnaireCreation = () => {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const { toast } = useToast();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('');
	const [questions, setQuestions] = useState([]);
	const [images, setImages] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [draftSaved, setDraftSaved] = useState(false);

	useEffect(() => {
		loadImages();
		loadCategories();
	}, []);

	const loadImages = async () => {
		try {
			const { data, error } = await supabase
				.from('app_images')
				.select('id, name, file_path, description, category')
				.eq('category', 'QCM')
				.order('name');

			if (error) throw error;
			setImages(data || []);
		} catch (error) {
			console.error('Erreur chargement images QCM:', error);
		}
	};

	const loadCategories = async () => {
		try {
			const { data, error } = await supabase
				.from('tasks')
				.select('category')
				.neq('category', null);

			if (error) throw error;

			const uniqueCategories = [...new Set(data?.map(t => t.category) || [])];
			setCategories(uniqueCategories.filter(Boolean).sort());
		} catch (error) {
			console.error('Erreur chargement catégories:', error);
		}
	};

	const handleAddQuestion = () => {
		const newQuestion = {
			id: uuidv4(),
			text: '',
			helpText: '',
			questionType: 'mixed',
			icon: null,
			imageId: null,
			imageName: '',
			choices: Array(6)
				.fill(null)
				.map(() => ({
					id: uuidv4(),
					imageId: null,
					imageName: '',
					icon: null,
					text: '',
					isCorrect: false
				}))
		};

		setQuestions(prev => [...prev, newQuestion]);
	};

	const handleDeleteQuestion = (questionId) => {
		setQuestions(prev => prev.filter(q => q.id !== questionId));
	};

	const handleUpdateQuestionText = (questionId, field, value) => {
		setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, [field]: value } : q)));
	};

	const handleAddChoice = (questionId) => {
		setQuestions(prev =>
			prev.map(q => {
				if (q.id !== questionId) return q;
				if (q.choices.length >= 6) return q;
				return {
					...q,
					choices: [...q.choices, { id: uuidv4(), imageId: null, imageName: '', icon: null, text: '', isCorrect: false }]
				};
			})
		);
	};

	const handleDeleteChoice = (questionId, choiceId) => {
		setQuestions(prev =>
			prev.map(q => {
				if (q.id !== questionId) return q;
				if (q.choices.length <= 2) return q;
				return {
					...q,
					choices: q.choices.filter(c => c.id !== choiceId)
				};
			})
		);
	};

	const handleUpdateChoiceText = (questionId, choiceId, field, value) => {
		setQuestions(prev =>
			prev.map(q => {
				if (q.id !== questionId) return q;
				return {
					...q,
					choices: q.choices.map(c => (c.id === choiceId ? { ...c, [field]: value } : c))
				};
			})
		);
	};

	const handleToggleCorrect = (questionId, choiceId) => {
		setQuestions(prev =>
			prev.map(q => {
				if (q.id !== questionId) return q;
				return {
					...q,
					choices: q.choices.map(c => (c.id === choiceId ? { ...c, isCorrect: !c.isCorrect } : c))
				};
			})
		);
	};

	const validateForm = () => {
		const errors = [];
		if (!title.trim()) errors.push('Le titre est requis');
		if (!category) errors.push('La catégorie est requise');
		if (questions.length === 0) errors.push('Au moins une question est requise');

		questions.forEach((q, idx) => {
			if (!q.text.trim()) errors.push(`Question ${idx + 1}: le texte est requis`);

			const choicesWithContent = q.choices.filter(c => c.imageId || c.icon || c.text.trim());

			if (choicesWithContent.length < 2) {
				errors.push(`Question ${idx + 1}: au moins deux réponses (texte, image ou icône) sont requises`);
			}

			const correctAnswers = choicesWithContent.filter(c => c.isCorrect);
			if (correctAnswers.length === 0) {
				errors.push(`Question ${idx + 1}: au moins une réponse doit être marquée correcte`);
			}
		});

		return errors;
	};

	const handleSaveDraft = () => {
		const draft = {
			id: uuidv4(),
			type: 'questionnaire',
			title,
			description,
			category,
			questions
		};

		const drafts = JSON.parse(localStorage.getItem('questionnaireDrafts') || '[]');
		const existingIndex = drafts.findIndex(d => d.id === draft.id);

		if (existingIndex >= 0) {
			drafts[existingIndex] = draft;
		} else {
			drafts.push(draft);
		}

		localStorage.setItem('questionnaireDrafts', JSON.stringify(drafts));
		setDraftSaved(true);

		toast({
			title: 'Brouillon sauvegardé',
			description: 'Votre questionnaire a été sauvegardé localement'
		});

		setTimeout(() => setDraftSaved(false), 3000);
	};

	const handleSubmit = async () => {
		const errors = validateForm();
		if (errors.length > 0) {
			toast({
				title: 'Erreurs de validation',
				description: errors.join('\n'),
				variant: 'destructive'
			});
			return;
		}

		setLoading(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();

			if (!user) {
				toast({
					title: 'Erreur',
					description: 'Utilisateur non authentifié',
					variant: 'destructive'
				});
				return;
			}

			const { data: task, error: taskError } = await supabase
				.from('tasks')
				.insert([{
					title,
					description: description.trim() || null,
					category,
					owner_id: user.id,
					task_type: 'questionnaire'
				}])
				.select()
				.single();

			if (taskError) throw taskError;

			const { data: version, error: versionError } = await supabase
				.from('versions')
				.insert([{
					task_id: task.id,
					name: 'Version 1',
					version: 1,
					creation_status: 'pending'
				}])
				.select()
				.single();

			if (versionError) throw versionError;

			const questionsData = questions.map((q, idx) => {
				// Inclure toutes les propositions pour conserver l'ordre et éviter les pertes côté lecture.
				// La validation amont impose déjà ≥2 propositions remplies et ≥1 correcte.
				const allChoices = q.choices.map(c => ({ ...c, text: c.text.trim() }));

				const correctAnswers = allChoices
					.filter(c => c.isCorrect)
					.map(c => c.id);

				const questionData = {
					questionType: 'mixed',
					type: 'mixed',
					imageId: q.imageId,
					imageName: q.imageName,
					iconId: q.icon?.id || null,
					icon: q.icon
						? { id: q.icon.id, library: q.icon.library, name: q.icon.displayName || q.icon.name }
						: null,
					choices: allChoices.map(c => ({
						id: c.id,
						imageId: c.imageId,
						imageName: c.imageName,
						text: c.text,
						iconId: c.icon?.id || null,
						icon: c.icon
							? { id: c.icon.id, library: c.icon.library, name: c.icon.displayName || c.icon.name }
							: null,
						isCorrect: c.isCorrect
					})),
					correctAnswers
				};

				return {
					version_id: version.id,
					step_order: idx + 1,
					instruction: q.text,
					expected_input: JSON.stringify(questionData)
				};
			});

			const { error: stepsError } = await supabase.from('steps').insert(questionsData);
			if (stepsError) throw stepsError;

			toast({
				title: 'Succès!',
				description: 'Votre questionnaire a été créé et soumis pour validation'
			});

			navigate('/contributeur/mes-contributions');
		} catch (error) {
			console.error('Erreur:', error);
			toast({
				title: 'Erreur',
				description: error.message,
				variant: 'destructive'
			});
		} finally {
			setLoading(false);
		}
	};

	if (!currentUser) return null;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900">Créer un Questionnaire</h1>
					<p className="text-gray-600 mt-2">
						Créez un exercice d'apprentissage basé sur la sélection d'images, d'icônes ou de texte.
					</p>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Informations générales</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Titre du questionnaire *</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Ex: Identifier les paramètres Wi-Fi"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Décrivez l'objectif de ce questionnaire (optionnel)..."
								rows={3}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">Sélectionner...</option>
									{categories.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="space-y-4 mb-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
						<Button onClick={handleAddQuestion} className="gap-2">
							<Plus className="w-4 h-4" />
							Ajouter une question
						</Button>
					</div>

					{questions.length === 0 ? (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
								<HelpCircle className="w-12 h-12 mb-4 text-gray-300" />
								<p>Aucune question ajoutée</p>
								<p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
							</CardContent>
						</Card>
					) : (
						questions.map((question, qIdx) => (
							<Card key={question.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">Question {qIdx + 1}</CardTitle>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDeleteQuestion(question.id)}
											className="text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Texte de la question *</label>
										<input
											type="text"
											value={question.text}
											onChange={(e) => handleUpdateQuestionText(question.id, 'text', e.target.value)}
											placeholder="Ex: Quelle capture montre le menu des paramètres Wi-Fi?"
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Icône de la question (optionnel)</label>
										<IconSelector
											selectedIcon={question.icon}
											onSelect={(icon) => handleUpdateQuestionText(question.id, 'icon', icon)}
											onRemove={() => handleUpdateQuestionText(question.id, 'icon', null)}
											libraries={['fa6', 'bs', 'md', 'fi', 'hi2', 'ai', 'logos', 'skill', 'devicon']}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Texte d'aide (optionnel)</label>
										<input
											type="text"
											value={question.helpText}
											onChange={(e) => handleUpdateQuestionText(question.id, 'helpText', e.target.value)}
											placeholder="Ex: Cherchez l'engrenage et Wi-Fi"
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Image de la question (optionnel)</label>
										{question.imageId ? (
											<div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
												<div className="flex items-center gap-2">
													<ImageIcon className="w-4 h-4 text-blue-600" />
													<span className="text-sm font-medium text-blue-900">{question.imageName}</span>
												</div>
												<div className="flex gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															handleUpdateQuestionText(question.id, 'imageId', null);
															handleUpdateQuestionText(question.id, 'imageName', '');
														}}
														className="text-blue-600 hover:text-blue-700"
													>
														Retirer
													</Button>
												</div>
											</div>
										) : (
											<div className="max-h-60 overflow-y-auto border rounded-lg bg-gray-50">
												<div className="grid grid-cols-3 gap-2 p-2">
													{images.map(img => (
														<button
															key={img.id}
															onClick={() => {
																handleUpdateQuestionText(question.id, 'imageId', img.id);
																handleUpdateQuestionText(question.id, 'imageName', img.name);
															}}
															className="p-2 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white"
														>
															<img
																src={img.file_path}
																alt={img.name}
																className="w-full h-20 object-cover rounded mb-1"
																onError={(e) => {
																	e.target.style.display = 'none';
																}}
															/>
															<p className="text-xs text-gray-700 line-clamp-2">{img.name}</p>
														</button>
													))}
												</div>
											</div>
										)}
									</div>

									<div className="space-y-4">
										<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
											Chaque réponse peut contenir un texte, une image, une icône ou une combinaison des trois. Marquez au moins une réponse correcte.
										</div>

										<label className="block text-sm font-medium text-gray-700">Réponses possibles (2-6 propositions) *</label>

										<div className="space-y-3">
											{question.choices.map((choice, cIdx) => (
												<div key={choice.id} className="border rounded-lg p-4">
													<div className="flex items-center justify-between mb-3">
														<span className="text-sm font-medium text-gray-700">Réponse {cIdx + 1}</span>
														<div className="flex gap-2">
															<label className="flex items-center gap-2 cursor-pointer">
																<input
																	type="checkbox"
																	checked={choice.isCorrect}
																	onChange={() => handleToggleCorrect(question.id, choice.id)}
																	className="w-4 h-4 rounded"
																/>
																<span className="text-xs text-gray-600">Correcte</span>
															</label>
															{question.choices.length > 2 && (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => handleDeleteChoice(question.id, choice.id)}
																	className="text-red-600 hover:text-red-700 hover:bg-red-50"
																>
																	<Trash2 className="w-4 h-4" />
																</Button>
															)}
														</div>
													</div>

													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div>
															<label className="block text-xs font-medium text-gray-600 mb-2">Image (optionnel)</label>
															{choice.imageName ? (
																<div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200 flex items-center justify-between">
																	<div className="flex items-center gap-2">
																		<ImageIcon className="w-4 h-4 text-blue-600" />
																		<span className="text-xs text-blue-900">{choice.imageName}</span>
																	</div>
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => {
																			handleUpdateChoiceText(question.id, choice.id, 'imageId', null);
																			handleUpdateChoiceText(question.id, choice.id, 'imageName', '');
																		}}
																		className="text-blue-600 hover:text-blue-700 p-0 h-6"
																	>
																		<X className="w-3 h-3" />
																	</Button>
																</div>
															) : (
																<div className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2">
																	<div className="grid grid-cols-3 gap-2">
																		{images.map(img => (
																			<button
																				key={img.id}
																				onClick={() => {
																					handleUpdateChoiceText(question.id, choice.id, 'imageId', img.id);
																					handleUpdateChoiceText(question.id, choice.id, 'imageName', img.name);
																				}}
																				className="p-1 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white"
																			>
																				<img
																					src={img.file_path}
																					alt={img.name}
																					className="w-full h-16 object-cover rounded mb-1"
																					onError={(e) => {
																						e.target.style.display = 'none';
																					}}
																				/>
																				<p className="text-xs text-gray-600 line-clamp-1">{img.name}</p>
																			</button>
																		))}
																	</div>
																</div>
															)}
														</div>

														<div className="space-y-3">
															<div>
																<label className="block text-xs font-medium text-gray-600 mb-2">Texte (optionnel)</label>
																<input
																	type="text"
																	value={choice.text}
																	onChange={(e) => handleUpdateChoiceText(question.id, choice.id, 'text', e.target.value)}
																	placeholder="Ex: Mode poche, Notifications..."
																	className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
																/>
															</div>

															<div>
																<label className="block text-xs font-medium text-gray-600 mb-1">Icône (optionnel)</label>
																<IconSelector
																	selectedIcon={choice.icon}
																	onSelect={(icon) => handleUpdateChoiceText(question.id, choice.id, 'icon', icon)}
																	onRemove={() => handleUpdateChoiceText(question.id, choice.id, 'icon', null)}
																	libraries={['fa6', 'bs', 'md', 'fi', 'hi2', 'ai', 'logos', 'skill', 'devicon']}
																	showLibraryTabs={false}
																/>
															</div>
														</div>
													</div>
												</div>
											))}

											{question.choices.length < 6 && (
												<Button onClick={() => handleAddChoice(question.id)} variant="outline" className="w-full gap-2">
													<Plus className="w-4 h-4" />
													Ajouter une réponse
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>

				<div className="flex gap-4">
					<Button onClick={handleSaveDraft} variant="outline" className="flex-1">
						{draftSaved ? 'Brouillon sauvegardé' : 'Sauvegarder comme brouillon'}
					</Button>
					<Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
						{loading ? 'Création en cours...' : 'Créer et soumettre'}
					</Button>
					<Button onClick={() => navigate('/contributeur')} variant="outline" className="flex-1">
						Annuler
					</Button>
				</div>
			</div>
		</div>
	);
};

export default QuestionnaireCreation;

