define(function(){
// Ɓ  	Ɖ 	Ɛ 	Ǝ 	Ƒ  Ɣ Ŋ Ɔ Ʃ 	Ʋ	Ʒ
// ɓ 	ɖ  	ɛ 	ǝ 	ƒ  ɣ ŋ ɔ ʃ 	ʋ 	ʒ

/*
a 	α 	ʌ 	b 	ɓ 	c 	τ 	ç 	d 	ɗ 	ɖ 	ð 	e 	ɛ 	ǝ
f 	ƒ 	g 	ɠ 	ɣ 	h 	ɦ 	i 	ɩ 	j 	ɟ 	k 	ƙ 	l 	λ
m 	ɴ 	n 	ŋ 	ɲ 	o 	ɔ 	p 	ƥ 	q 	r 	ɽ 	s 	ʃ 	t
ƭ 	ʈ 	θ 	u 	ω 	v 	ʋ 	w 	x 	y 	ƴ 	z 	ʒ 	ƹ 	ʔ

*/

let UPPERCASE_LETTERS;
const LOWERCASE_LETTERS = [
    ['ɓ','ɖ','ɛ','ǝ','Ǝ','ƒ','ɣ','ŋ','ɔ','ʃ', 'ʋ'],
    ['ʒ', 'α','ʌ', 'τ', 'ç', 'ɖ','ɠ ','ð','ɟ','ƙ'],
    ['λ','ɲ','ƥ','ɽ','ƭ','θ','ω','ƴ','ƹ'],
    ['ḍ','c̱','ṣ','ⲁ','ⲃ','ⲅ','ⲉ','ⲍ','ⲏ','ⲑ','ⲗ','ⲝ'],
    ['ⲡ','ⲣ','ⲧ','ⲩ','ⲫ','ⲭ', 'ⲯ','ϣ','ϥ','ϫ','ϭ','ϯ','ⳁ']
];
UPPERCASE_LETTERS = LOWERCASE_LETTERS.map((row,index) => {
    return row.map(s => s.toUpperCase());
});

return {
    'UPPERCASE_LETTERS': UPPERCASE_LETTERS,
    'LOWERCASE_LETTERS': LOWERCASE_LETTERS
}
});