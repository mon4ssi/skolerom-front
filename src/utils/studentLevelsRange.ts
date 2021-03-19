const twoLevels = 2;

export const getStudentLevelsRange = (levels: Array<number>) => {
  const firstItem = levels[0];
  const lastItem = levels[levels.length - 1];

  return (
    levels.length === 1 ? `${firstItem}` :
      levels.length === twoLevels && lastItem - firstItem !== 1 ? `${firstItem}, ${lastItem}` :
      `${firstItem}-${lastItem}`
  );
};
