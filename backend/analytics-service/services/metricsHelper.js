exports.calculateEngagementRate = (
  activeStudents,
  totalStudents
) => {

  if (totalStudents === 0) {
    return 0;
  }

  return Number(
    (
      (activeStudents / totalStudents) * 100
    ).toFixed(2)
  );
};