export class Util {
    private static _generations = [
        'https://pokeapi.co/api/v2/pokemon/?limit=151&offset=0',
        'https://pokeapi.co/api/v2/pokemon/?limit=100&offset=151',
        'https://pokeapi.co/api/v2/pokemon/?limit=135&offset=251',
        'https://pokeapi.co/api/v2/pokemon/?limit=107&offset=386',
        'https://pokeapi.co/api/v2/pokemon/?limit=156&offset=493',
        'https://pokeapi.co/api/v2/pokemon/?limit=72&offset=649',
        'https://pokeapi.co/api/v2/pokemon/?limit=88&offset=721',
        'https://pokeapi.co/api/v2/pokemon/?limit=89&offset=809',
    ];

    private static _fixedNames = new Map([
        ['nidoran-f', 'nidoran ♀'],
        ['nidoran-m', 'nidoran ♂'],
        ['mr-mime', 'mr. mime'],
        ['deoxys-normal', 'deoxys'],
        ['wormadam-plant', 'wormadam'],
        ['mime-jr', 'mime jr.'],
        ['giratina-altered', 'giratina'],
        ['shaymin-land', 'shaymin'],
        ['basculin-red-striped', 'basculin'],
        ['darmanitan-standard', 'darmanitan'],
        ['tornadus-incarnate', 'tornadus'],
        ['thundurus-incarnate', 'thundurus'],
        ['landorus-incarnate', 'landorus'],
        ['keldeo-ordinary', 'keldeo'],
        ['meloetta-aria', 'meloetta'],
        ['meowstic-male', 'meowstic ♂'],
        ['aegislash-shield', 'aegislash'],
        ['pumpkaboo-average', 'pumpkaboo'],
        ['gourgeist-average', 'gourgeist'],
        ['zygarde-50', 'zygarde'],
        ['oricorio-baile', 'oricorio'],
        ['lycanroc-midday', 'lycanroc'],
        ['wishiwashi-solo', 'wishiwashi'],
        ['minior-red-meteor', 'minior'],
        ['mimikyu-disguised', 'mimikyu'],
        ['toxtricity-amped', 'toxtricity'],
        ['mr-rime', 'mrrime'],
        ['eiscue-ice', 'eiscue'],
        ['indeedme-male', 'indeedee ♂'],
        ['morpeko-full-belly', 'morpeko'],
        ['urshifu-single-strike', 'urshifu'],
    ]);

    private static _fixedNamesForAudio = new Map([
        ['nidoran-f', 'nidoranf'],
        ['nidoran-m', 'nidoranm'],
        ['mr-mime', 'mrmime'],
        ['deoxys-normal', 'deoxys'],
        ['wormadam-plant', 'wormadam'],
        ['mime-jr', 'mimejr'],
        ['giratina-altered', 'giratina'],
        ['shaymin-land', 'shaymin'],
        ['basculin-red-striped', 'basculin'],
        ['darmanitan-standard', 'darmanitan'],
        ['tornadus-incarnate', 'tornadus'],
        ['thundurus-incarnate', 'thundurus'],
        ['landorus-incarnate', 'landorus'],
        ['keldeo-ordinary', 'keldeo'],
        ['meloetta-aria', 'meloetta'],
        ['meowstic-male', 'meowstic'],
        ['aegislash-shield', 'aegislash'],
        ['pumpkaboo-average', 'pumpkaboo'],
        ['gourgeist-average', 'gourgeist'],
        ['zygarde-50', 'zygarde'],
        ['oricorio-baile', 'oricorio'],
        ['lycanroc-midday', 'lycanroc'],
        ['wishiwashi-solo', 'wishiwashi'],
        ['minior-red-meteor', 'minior'],
        ['mimikyu-disguised', 'mimikyu'],
        ['jangmo-o', 'jangmoo'],
        ['hakamo-o', 'hakamoo'],
        ['kommo-o', 'kommoo'],
        ['tapu-koko', 'tapukoko'],
        ['tapu-lele', 'tapulele'],
        ['tapu-bulu', 'tapubulu'],
        ['tapu-fini', 'tapufini'],
        ['toxtricity-amped', 'toxtricity'],
        ['mr-rime', 'mrrime'],
        ['eiscue-ice', 'eiscue'],
        ['indeedme-male', 'indeedee'],
        ['morpeko-full-belly', 'morpeko'],
        ['urshifu-single-strike', 'urshifu'],
    ]);

    static getFixedNameForAudio(name: string) {
        if (this._fixedNamesForAudio.has(name)) {
            return this._fixedNamesForAudio.get(name);
        }
        return name;
    }
    
    static getGeneration(generation: number) {
        if (this._generations[generation - 1]) {
            return this._generations[generation - 1];
        };
        return this._generations[0];
    }

    static getFixedName(name: string) {
        if (this._fixedNames.has(name)) {
            return this._fixedNames.get(name);
        }
        return name;
    }

    static getStatInfo(stat: string) {
        switch (stat) {
            case 'hp':
                return ['HP', '#FF5959'];
            case 'attack':
                return ['ATK', '#F5AC78'];
            case 'defense':
                return ['DEF', '#FAE078'];
            case 'special-attack':
                return ['SP. ATK', '#9DB7F5'];
            case 'special-defense':
                return ['SP. DEF', '#A7DB8D'];
            case 'speed':
                return ['SPD', '#FA92B2'];
            default:
                return ['?', '#F5A05F'];
        }
    }
}
