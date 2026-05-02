/*
Generate feedback and practice suggestions
*/

exports.generateFeedback = (
  spacing,
  baseline,
  consistency
)=>{

  const messages = [];

  if(spacing < 60)
    messages.push(
      "Spacing is too crowded. Leave clearer gaps."
    );

  if(baseline < 70)
    messages.push(
      "Letters are not aligned with the baseline."
    );

  if(consistency < 60)
    messages.push(
      "Letter heights are inconsistent."
    );

  if(messages.length === 0)
    messages.push("Great handwriting!");

  return messages;

};


exports.practiceSuggestions = (
  spacing,
  baseline,
  consistency
)=>{

  const exercises = [];

  if(spacing < 60)
    exercises.push("Space Race");

  if(consistency < 60)
    exercises.push("Letter Factory");

  if(baseline < 70)
    exercises.push("Train Track");

  return exercises;

};