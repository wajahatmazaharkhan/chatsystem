const service =
  require("../services/statusService");

exports.getStudentStatus = async (req, res) => {

  try {

    const result =
      await service.getStudentStatus(req.params.id);

    res.status(200).json(result);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};

exports.getGroupStatus = async (req, res) => {

  try {

    const result =
      await service.getGroupStatus(req.params.id);

    res.status(200).json(result);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};