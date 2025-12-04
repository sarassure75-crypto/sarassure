# QCM System - Before/After Comparison

## Issue 1: Database Schema Error

### BEFORE ❌
```javascript
const { error: stepsError } = await supabase
  .from('steps')
  .insert(questionsData);
```

Where `questionsData` included:
```javascript
{
  version_id: version.id,
  step_order: idx + 1,
  instruction: q.text,
  expected_input: JSON.stringify(questionData),
  creation_status: 'pending'  // ❌ ERROR: COLUMN DOESN'T EXIST
}
```

**Result:** `Could not find the 'creation_status' column of 'steps' in the schema cache`

### AFTER ✅
```javascript
const { error: stepsError } = await supabase
  .from('steps')
  .insert(questionsData);
```

Where `questionsData` now includes:
```javascript
{
  version_id: version.id,
  step_order: idx + 1,
  instruction: q.text,
  expected_input: JSON.stringify(questionData)
  // ✅ CORRECT: No creation_status (only in versions table)
}
```

---

## Issue 2: Answer Type Support

### BEFORE ❌
- Only 2 question types:
  1. `image_choice` - Images only (2-3 fixed options)
  2. `image_text` - Image + Text answers (3 fixed options)
- Separate arrays for each type
- Limited to 2-3 options only

### AFTER ✅
- 3 question types:
  1. `image_choice` - Images only (2-6 flexible options)
  2. `image_text` - Text only (2-6 flexible options)
  3. `mixed` - Image + Text labels (2-6 flexible options)
- Unified `choices` array for all types
- 2-6 options with add/delete UI

---

## Issue 3: Correct Answers Selection

### BEFORE ❌
```javascript
// Exclusive selection (radio button style)
const handleMarkCorrect = (questionId, choiceId) => {
  setQuestions(questions.map(q => {
    if (q.id !== questionId) return q;
    return {
      ...q,
      choices: q.choices.map(c => ({
        ...c,
        isCorrect: c.id === choiceId  // ❌ Only ONE can be true
      }))
    };
  }));
};
```

**Button UI:**
```jsx
<Button onClick={() => handleMarkCorrect(question.id, choice.id)}>
  {choice.isCorrect ? '✓ Réponse correcte' : 'Marquer comme correcte'}
</Button>
```

**Result:** Clicking a choice unmarks all others (exclusive)

### AFTER ✅
```javascript
// Multi-select (checkbox style)
const handleToggleCorrect = (questionId, choiceId) => {
  setQuestions(questions.map(q => {
    if (q.id !== questionId) return q;
    return {
      ...q,
      choices: q.choices.map(c =>
        c.id === choiceId ? { ...c, isCorrect: !c.isCorrect } : c
        // ✅ Toggle only the clicked choice, others unchanged
      )
    };
  }));
};
```

**Checkbox UI:**
```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={choice.isCorrect}
    onChange={() => handleToggleCorrect(question.id, choice.id)}
    className="w-4 h-4 rounded"
  />
  <span className="text-xs text-gray-600">Correcte</span>
</label>
```

**Result:** Can mark multiple choices as correct simultaneously

---

## Issue 4: Number of Answer Options

### BEFORE ❌
```javascript
// Hardcoded 2 or 3 choices
const newQuestion = {
  id: uuidv4(),
  text: '',
  questionType: 'image_choice',
  answerType: '2choices',  // ❌ Only 2 or 3
  choices: [
    { id: uuidv4(), imageId: null, isCorrect: false },
    { id: uuidv4(), imageId: null, isCorrect: false }
  ]
};
```

**UI:** Only 2-3 fixed slots, no add/delete buttons

### AFTER ✅
```javascript
// Flexible 2-6 choices
const newQuestion = {
  id: uuidv4(),
  text: '',
  questionType: 'image_choice',
  choices: Array(6).fill(null).map(() => ({  // ✅ 6 slots
    id: uuidv4(),
    imageId: null,
    imageName: '',
    text: '',
    isCorrect: false
  }))
};
```

**Handler Functions:**
```javascript
// Add choice (max 6)
const handleAddChoice = (questionId) => {
  setQuestions(questions.map(q => {
    if (q.id !== questionId) return q;
    if (q.choices.length >= 6) return q;  // ✅ Cap at 6
    return {
      ...q,
      choices: [...q.choices, { id: uuidv4(), ... }]
    };
  }));
};

// Delete choice (min 2)
const handleDeleteChoice = (questionId, choiceId) => {
  setQuestions(questions.map(q => {
    if (q.id !== questionId) return q;
    if (q.choices.length <= 2) return q;  // ✅ Keep minimum 2
    return {
      ...q,
      choices: q.choices.filter(c => c.id !== choiceId)
    };
  }));
};
```

**UI:** Add/Delete buttons appear when < 6 or > 2 respectively

---

## Issue 5: Description Field

### BEFORE ❌
```javascript
// Validation
if (!description.trim()) 
  errors.push('La description est requise');  // ❌ Required

// UI
<label className="block text-sm font-medium text-gray-700 mb-2">
  Description *  {/* ❌ Asterisk = required */}
</label>
```

### AFTER ✅
```javascript
// Validation (removed)
// ✅ No check for description

// UI
<label className="block text-sm font-medium text-gray-700 mb-2">
  Description  {/* ✅ No asterisk = optional */}
</label>
<textarea
  placeholder="Décrivez l'objectif de ce questionnaire (optionnel)..."  {/* ✅ Explicit */}
/>
```

**Database:**
```javascript
const { data: taskData } = await supabase
  .from('tasks')
  .insert({
    title,
    description: description.trim() || null,  // ✅ null if empty
    category,
    owner_id: user.id
  })
```

---

## Issue 6: Category Selection

### BEFORE ❌
```javascript
// Hardcoded options
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="">Sélectionner...</option>
  <option value="Communication">Communication</option>
  <option value="Réseaux sociaux">Réseaux sociaux</option>
  <option value="Paramètres">Paramètres</option>
  <option value="Applications">Applications</option>
  <option value="Sécurité">Sécurité</option>
</select>
```

**Problem:** Doesn't match existing exercise categories

### AFTER ✅
```javascript
// Dynamic loading
const loadCategories = async () => {
  const { data } = await supabase
    .from('tasks')
    .select('category')
    .neq('category', null);
  
  const uniqueCategories = [...new Set(data?.map(t => t.category))];
  setCategories(uniqueCategories.filter(Boolean).sort());
};

// UI renders dynamic options
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="">Sélectionner...</option>
  {categories.map((cat) => (  // ✅ From database
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>
```

**Result:** Categories automatically match existing exercises

---

## Question Type Comparison

### Type Support

| Feature | BEFORE | AFTER |
|---------|--------|-------|
| Image Choices | ✅ (2-3 only) | ✅ (2-6) |
| Text Answers | ✅ (3 only) | ✅ (2-6) |
| Mixed Type | ❌ | ✅ (2-6) |
| Multiple Correct | ❌ | ✅ |
| Dynamic Categories | ❌ | ✅ |
| Optional Description | ❌ | ✅ |

### State Structure

#### BEFORE ❌
```javascript
{
  id: uuid,
  text: string,
  questionType: 'image_choice' | 'image_text',
  answerType: '2choices' | '3choices',  // SEPARATE
  choices: [...],  // For image_choice
  textAnswers: [...],  // For image_text - SEPARATE ARRAY
  imageId: uuid,
  imageName: string,
  helpText: string
}
```

#### AFTER ✅
```javascript
{
  id: uuid,
  text: string,
  questionType: 'image_choice' | 'image_text' | 'mixed',
  choices: [  // UNIFIED ARRAY
    {
      id: uuid,
      imageId: uuid,       // Used by: image_choice, mixed
      imageName: string,   // Used by: image_choice, mixed
      text: string,        // Used by: image_text, mixed
      isCorrect: boolean   // Multiple can be true
    },
    ...  // Up to 6 slots
  ],
  imageId: uuid,      // For image_text, mixed question image
  imageName: string   // For image_text, mixed question image
}
```

---

## Validation Changes

### BEFORE ❌
```javascript
const validateForm = () => {
  const errors = [];
  if (!title.trim()) errors.push('Le titre est requis');
  if (!description.trim()) errors.push('La description est requise');  // ❌
  if (!category) errors.push('La catégorie est requise');
  if (questions.length === 0) errors.push('Au moins une question est requise');
  
  questions.forEach((q, idx) => {
    if (!q.text.trim()) errors.push(`Question ${idx + 1}: le texte est requis`);
    
    if (q.questionType === 'image_choice') {
      const choicesWithImages = q.choices.filter(c => c.imageId);
      if (choicesWithImages.length === 0) {
        errors.push(`Question ${idx + 1}: au moins une image est requise`);
      }
      
      const correctAnswers = q.choices.filter(c => c.isCorrect);
      if (correctAnswers.length === 0) {
        errors.push(`Question ${idx + 1}: veuillez marquer la réponse correcte`);  // ❌ Singular
      }
    } else if (q.questionType === 'image_text') {
      if (!q.imageId) {
        errors.push(`Question ${idx + 1}: une image est requise`);
      }
      
      const filledAnswers = q.textAnswers.filter(a => a.text.trim());
      if (filledAnswers.length === 0) {
        errors.push(`Question ${idx + 1}: au moins une réponse texte est requise`);
      }
      
      const correctAnswers = q.textAnswers.filter(a => a.isCorrect);
      if (correctAnswers.length === 0) {
        errors.push(`Question ${idx + 1}: veuillez marquer la réponse correcte`);
      }
    }
  });
  
  return errors;
};
```

### AFTER ✅
```javascript
const validateForm = () => {
  const errors = [];
  if (!title.trim()) errors.push('Le titre est requis');
  // ✅ No description validation
  if (!category) errors.push('La catégorie est requise');
  if (questions.length === 0) errors.push('Au moins une question est requise');
  
  questions.forEach((q, idx) => {
    if (!q.text.trim()) errors.push(`Question ${idx + 1}: le texte est requis`);
    
    // Unified validation for all types
    const filledChoices = q.choices.filter(c => c.imageId || c.text.trim());
    if (filledChoices.length === 0) {
      errors.push(`Question ${idx + 1}: au moins une réponse est requise (image ou texte)`);
    }
    
    // Check at least one filled choice is marked correct
    const correctAnswers = filledChoices.filter(c => c.isCorrect);
    if (correctAnswers.length === 0) {
      errors.push(`Question ${idx + 1}: au moins une réponse doit être marquée correcte`);  // ✅ Flexible
    }
    
    // For image_text or mixed, image is required
    if ((q.questionType === 'image_text' || q.questionType === 'mixed') && !q.imageId) {
      errors.push(`Question ${idx + 1}: une image est requise pour ce type de question`);
    }
  });
  
  return errors;
};
```

---

## Summary Table

| Change | BEFORE | AFTER | Impact |
|--------|--------|-------|--------|
| **Creation Status in steps** | ❌ Inserted (error) | ✅ Removed | ✅ Fixes database error |
| **Correct answers** | ❌ Radio (exclusive) | ✅ Checkbox (multi) | ✅ Multiple correct answers |
| **Answer options** | ❌ 2-3 fixed | ✅ 2-6 flexible | ✅ More flexibility |
| **Question types** | ❌ 2 types | ✅ 3 types | ✅ Text-only answers |
| **Description required** | ❌ Yes | ✅ Optional | ✅ More user-friendly |
| **Categories** | ❌ Hardcoded | ✅ Dynamic | ✅ Matches exercises |
| **Choice array** | ❌ Separate arrays | ✅ Unified array | ✅ Simpler code |

---

## Testing Impact

### Questions to Test

1. **Text-Only Answers**
   - Create question with `image_text` type
   - Add 4 text answers without images
   - Mark 2 as correct
   - Submit and verify

2. **Multiple Correct**
   - Create image_choice question
   - Mark 2-3 images as correct
   - Verify all checkboxes remain checked
   - Submit and verify database

3. **6 Answer Options**
   - Create question with 6 answers
   - Try to add 7th (should be disabled)
   - Delete to 2 answers (min limit)
   - Try to delete further (should be disabled)

4. **Optional Description**
   - Submit questionnaire without description
   - Should not error
   - Database should store null

5. **Dynamic Categories**
   - Check category dropdown
   - Verify matches existing tasks
   - Should be alphabetically sorted

6. **Database Schema**
   - No `creation_status` in steps insert
   - `expected_input` contains all question metadata
   - Multiple `isCorrect: true` values supported

