const writingService =
  require("./writing.service");


exports.analyzeImage = async (req,res)=>{

  try{

    const image = req.body.image;

    const result =
      await writingService.evaluateWriting(image);

    res.json(result);

  }
  catch(error){

    console.log(error);

    res.status(500).json({
      message:"Image analysis failed"
    });

  }

};


exports.analyzeDrawing = async (req,res)=>{

  try{

    const drawing = req.body.drawing;

    const result =
      await writingService.evaluateDrawing(drawing);

    res.json(result);

  }
  catch(error){

    console.log(error);

    res.status(500).json({
      message:"Drawing analysis failed"
    });

  }

};