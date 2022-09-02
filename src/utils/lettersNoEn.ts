export const lettersNoEn = (string: string): boolean => {
  const regExp = /^[0-9a-zA-Z,.?!_()!?:‘;#%{}@$^&*=+"'’«»“—”–<>/\-[\] æøåáàÆØÅâéèêóôòöœōõäãā]*$/;
  return regExp.test(string);
};
