define(function(){
// Ɓ  	Ɖ 	Ɛ 	Ǝ 	Ƒ  Ɣ Ŋ Ɔ Ʃ 	Ʋ	Ʒ
// ɓ 	ɖ  	ɛ 	ǝ 	ƒ  ɣ ŋ ɔ ʃ 	ʋ 	ʒ

/*
a 	α 	ʌ 	b 	ɓ 	c 	τ 	ç 	d 	ɗ 	ɖ 	ð 	e 	ɛ 	ǝ
f 	ƒ 	g 	ɠ 	ɣ 	h 	ɦ 	i 	ɩ 	j 	ɟ 	k 	ƙ 	l 	λ
m 	ɴ 	n 	ŋ 	ɲ 	o 	ɔ 	p 	ƥ 	q 	r 	ɽ 	s 	ʃ 	t
ƭ 	ʈ 	θ 	u 	ω 	v 	ʋ 	w 	x 	y 	ƴ 	z 	ʒ 	ƹ 	ʔ

*/

const CHUNK_SIZE = 10;
const GROUPS_SIZE = 4;

function regroup_chunks(chunks, n){
    let groups = [];
    for(let i = 0; i < chunks.length; i++){
        if(i % n === 0){
            groups.push([chunks[i]]);
        }else{
            groups[groups.length - 1].push(chunks[i]);
        }
    }
    return groups;
}

function chunks_of(str, n){
    let chunks = [];
    let chunk = undefined;
    for(let i = 0, size = str.length; i < size; i += n){
        chunk = str.substring(i, i + n);
        chunks.push(chunk.split(''));
    }
    return chunks;
}
let SPECIAL_CHARACTERS_LOWER = "āǎαʌⲃɓτⲥçɗðēeⲉɛǝẹƒɠɖɣⲯɦɩɟⲓƙλϫɴŋɲñɔọƥɽṣʃⳁƭʈⲩⲗθʉⲫωϣⲭvⲡʋⲏϥϩzʒƹⲝʔɽ";
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

let SPECIAL_CHARACTERS_GROUPS = regroup_chunks(chunks_of(SPECIAL_CHARACTERS_LOWER, CHUNK_SIZE), GROUPS_SIZE);

return {
    'UPPERCASE_LETTERS': UPPERCASE_LETTERS,
    'LOWERCASE_LETTERS': LOWERCASE_LETTERS,
    'SPECIAL_CHARACTERS_GROUPS': SPECIAL_CHARACTERS_GROUPS
}
});