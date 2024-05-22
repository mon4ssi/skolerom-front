export const lettersNoEn = (string: string): boolean => {  
  const regExp = /^[0-9a-zA-Z,.?!_()!?:‘;#%{}@$^&*=+"'’«»“—”–<>/\-[\] æøåáàÆØÅâéèêóôòöœōõäãāÈIOUÜÄËÖÜäëöü]*$/;
  return regExp.test(string);
};
