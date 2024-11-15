export default function (title: string, length = 14) {
    const pattern = `((?=([\\w\\W]{0,${length}}))([\\w\\W]{${length + 1},})([\\w\\W]{8,}))`;

    return title.replace(new RegExp(pattern), '$2..$4');
};
