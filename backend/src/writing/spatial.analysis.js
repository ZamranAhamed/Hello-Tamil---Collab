/*
Spatial Awareness Evaluation Engine
Evaluates:
- spacing
- baseline alignment
- letter consistency
*/

function detectLetters() {

  // simulated letter boxes
  // later replaced with OpenCV

  return [
    { x: 10, y: 20, width: 40, height: 40 },
    { x: 65, y: 22, width: 38, height: 39 },
    { x: 120, y: 21, width: 41, height: 40 }
  ];

}


/* SPACING MODEL */

function evaluateSpacing(letters){

  let gaps = [];

  for(let i=0;i<letters.length-1;i++){

    const gap =
      letters[i+1].x -
      (letters[i].x + letters[i].width);

    gaps.push(gap);

  }

  const avg =
    gaps.reduce((a,b)=>a+b,0) / gaps.length;

  if(avg > 20) return 80;
  if(avg > 10) return 60;

  return 30;
}


/* BASELINE MODEL */

function evaluateBaseline(letters){

  const bottoms =
    letters.map(l => l.y + l.height);

  const avg =
    bottoms.reduce((a,b)=>a+b,0) /
    bottoms.length;

  const variance =
    bottoms.reduce(
      (sum,val)=>sum + Math.pow(val-avg,2),
      0
    ) / bottoms.length;

  const deviation = Math.sqrt(variance);

  if(deviation < 3) return 90;
  if(deviation < 6) return 70;

  return 50;
}


/* LETTER CONSISTENCY */

function evaluateConsistency(letters){

  const heights =
    letters.map(l => l.height);

  const avg =
    heights.reduce((a,b)=>a+b,0) /
    heights.length;

  const variance =
    heights.reduce(
      (sum,val)=>sum + Math.pow(val-avg,2),
      0
    ) / heights.length;

  const deviation = Math.sqrt(variance);

  if(deviation < 3) return 85;
  if(deviation < 6) return 65;

  return 40;
}


/* MAIN ENGINE */

exports.runSpatialAnalysis = () => {

  const letters = detectLetters();

  const spacing =
    evaluateSpacing(letters);

  const baseline =
    evaluateBaseline(letters);

  const consistency =
    evaluateConsistency(letters);

  const overall =
    Math.round(
      (spacing + baseline + consistency)/3
    );

  return {

    spacingScore: spacing,
    baselineScore: baseline,
    letterConsistencyScore: consistency,
    overallScore: overall

  };

};