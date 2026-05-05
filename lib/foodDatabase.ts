export interface FoodDBItem {
  id: string
  name: string
  cal: number    // kcal por 100 g
  p: number      // proteína g por 100 g
  c: number      // carboidrato g por 100 g
  f: number      // gordura g por 100 g
  serving?: number // porção padrão em gramas
  // Campos opcionais para alimentos medidos por unidade
  unitLabel?: string  // ex: 'unidade', 'fatia', 'colher'
  unitGrams?: number  // peso de 1 unidade em gramas
  unitOnly?: boolean  // true = medir APENAS por unidade (ex: ovo, banana)
}

export const FOOD_DB: readonly FoodDBItem[] = [
  // ── CEREAIS & GRÃOS ──────────────────────────────────────────
  { id: 'arroz_b',   name: 'Arroz branco cozido',      cal: 130, p: 2.7, c: 28,  f: 0.3, serving: 150 },
  { id: 'arroz_i',   name: 'Arroz integral cozido',    cal: 111, p: 2.6, c: 23,  f: 0.9, serving: 150 },
  { id: 'macarrao',  name: 'Macarrão cozido',           cal: 158, p: 5.8, c: 31,  f: 0.9, serving: 200 },
  { id: 'mac_int',   name: 'Macarrão integral cozido', cal: 124, p: 5.2, c: 26,  f: 0.5, serving: 200 },
  { id: 'pao_b',     name: 'Pão branco',                cal: 265, p: 9,   c: 49,  f: 3.2, serving: 50  },
  { id: 'pao_int',   name: 'Pão integral',              cal: 247, p: 8.5, c: 44,  f: 3.5, serving: 50  },
  { id: 'aveia',     name: 'Aveia em flocos',            cal: 389, p: 17,  c: 66,  f: 7,   serving: 40  },
  { id: 'granola',   name: 'Granola',                    cal: 471, p: 10,  c: 64,  f: 20,  serving: 40  },
  { id: 'milho',     name: 'Milho cozido',               cal: 96,  p: 3.4, c: 21,  f: 1.5, serving: 100 },
  { id: 'quinoa',    name: 'Quinoa cozida',              cal: 120, p: 4.4, c: 22,  f: 1.9, serving: 100 },
  { id: 'tapioca',   name: 'Tapioca (seca)',             cal: 358, p: 0.2, c: 88,  f: 0.3, serving: 30  },
  { id: 'cuscuz',    name: 'Cuscuz cozido',              cal: 110, p: 2.5, c: 24,  f: 0.5, serving: 150 },
  { id: 'far_aveia', name: 'Farinha de aveia',           cal: 370, p: 15,  c: 60,  f: 7,   serving: 40  },
  // Novos — cereais
  { id: 'pao_fran',  name: 'Pão francês',               cal: 300, p: 8,   c: 58,  f: 3,   serving: 50, unitLabel: 'unidade', unitGrams: 50 },
  { id: 'pao_queij', name: 'Pão de queijo',             cal: 314, p: 7,   c: 40,  f: 14,  serving: 40, unitLabel: 'unidade', unitGrams: 40 },
  { id: 'biscoito_agua', name: 'Biscoito de água e sal', cal: 421, p: 9,  c: 68,  f: 13,  serving: 30 },
  { id: 'canjica',   name: 'Canjica cozida',            cal: 152, p: 3.5, c: 34,  f: 0.8, serving: 150 },
  { id: 'farofa',    name: 'Farofa de manteiga',        cal: 380, p: 4,   c: 70,  f: 9,   serving: 50  },

  // ── PROTEÍNAS ANIMAIS ────────────────────────────────────────
  { id: 'frango_g',  name: 'Frango grelhado (peito)',   cal: 165, p: 31,  c: 0,   f: 3.6, serving: 120 },
  { id: 'frango_c',  name: 'Frango coxa (sem pele)',    cal: 174, p: 24,  c: 0,   f: 8.5, serving: 100 },
  { id: 'frango_d',  name: 'Frango desfiado',           cal: 187, p: 32,  c: 0,   f: 5.8, serving: 100 },
  { id: 'carne_b',   name: 'Carne bovina magra',        cal: 217, p: 26,  c: 0,   f: 12,  serving: 120 },
  { id: 'carne_m',   name: 'Carne moída (84%)',         cal: 215, p: 24,  c: 0,   f: 13,  serving: 100 },
  { id: 'carne_a',   name: 'Carne assada',              cal: 240, p: 28,  c: 0,   f: 14,  serving: 100 },
  { id: 'suino',     name: 'Carne suína (lombo)',       cal: 242, p: 27,  c: 0,   f: 14,  serving: 100 },
  { id: 'bacon',     name: 'Bacon',                     cal: 541, p: 37,  c: 1.4, f: 42,  serving: 30  },
  { id: 'presunto',  name: 'Presunto magro',            cal: 145, p: 21,  c: 2,   f: 5.5, serving: 50  },
  { id: 'peru_f',    name: 'Peito de peru fatiado',     cal: 107, p: 18,  c: 1.5, f: 3,   serving: 50  },
  { id: 'ovo_c',     name: 'Ovo cozido',                cal: 155, p: 13,  c: 1.1, f: 11,  serving: 60, unitLabel: 'unidade', unitGrams: 60 },
  { id: 'ovo_m',     name: 'Ovo mexido',                cal: 148, p: 10,  c: 1.6, f: 11,  serving: 60, unitLabel: 'unidade', unitGrams: 60 },
  { id: 'omelete',   name: 'Omelete (2 ovos)',          cal: 154, p: 11,  c: 1.3, f: 12,  serving: 120 },
  { id: 'salmao',    name: 'Salmão grelhado',           cal: 208, p: 20,  c: 0,   f: 13,  serving: 120 },
  { id: 'atum',      name: 'Atum em lata (água)',       cal: 116, p: 26,  c: 0,   f: 1,   serving: 80  },
  { id: 'tilapia',   name: 'Tilápia grelhada',          cal: 128, p: 26,  c: 0,   f: 2.7, serving: 120 },
  { id: 'sardinha',  name: 'Sardinha em lata',          cal: 208, p: 25,  c: 0,   f: 11,  serving: 80  },
  { id: 'camarao',   name: 'Camarão cozido',            cal: 99,  p: 24,  c: 0.2, f: 0.3, serving: 100 },
  { id: 'peru_g',    name: 'Peru grelhado (peito)',     cal: 189, p: 29,  c: 0,   f: 7,   serving: 120 },
  // Novos — proteínas animais / churrasco
  { id: 'picanha',   name: 'Picanha grelhada',          cal: 271, p: 25,  c: 0,   f: 18,  serving: 150 },
  { id: 'fraldinha', name: 'Fraldinha grelhada',        cal: 218, p: 27,  c: 0,   f: 12,  serving: 150 },
  { id: 'costela',   name: 'Costela bovina assada',     cal: 290, p: 23,  c: 0,   f: 22,  serving: 200 },
  { id: 'alcatra',   name: 'Alcatra grelhada',          cal: 197, p: 28,  c: 0,   f: 9,   serving: 150 },
  { id: 'maminha',   name: 'Maminha grelhada',          cal: 210, p: 27,  c: 0,   f: 11,  serving: 150 },
  { id: 'frango_brasa', name: 'Frango na brasa (coxa)', cal: 239, p: 26,  c: 0,   f: 14,  serving: 120, unitLabel: 'unidade', unitGrams: 120 },
  { id: 'coracao',   name: 'Coração de frango grelhado', cal: 185, p: 26, c: 0,   f: 9,   serving: 100 },
  { id: 'linguica_t', name: 'Linguiça toscana grelhada', cal: 290, p: 16, c: 2,   f: 24,  serving: 80, unitLabel: 'unidade', unitGrams: 80 },
  { id: 'linguica',  name: 'Linguiça (calabresa)',      cal: 310, p: 15,  c: 2.5, f: 27,  serving: 80, unitLabel: 'unidade', unitGrams: 80 },
  { id: 'bife',      name: 'Bife acebolado',            cal: 225, p: 27,  c: 4,   f: 11,  serving: 150 },
  { id: 'carne_sol', name: 'Carne de sol cozida',       cal: 236, p: 28,  c: 0,   f: 13,  serving: 120 },
  { id: 'frango_mil', name: 'Frango à milanesa',        cal: 247, p: 24,  c: 12,  f: 11,  serving: 120 },
  { id: 'salsicha',  name: 'Salsicha',                  cal: 310, p: 12,  c: 3,   f: 28,  serving: 50, unitLabel: 'unidade', unitGrams: 50 },
  { id: 'carne_moc', name: 'Mocotó (caldo)',            cal: 80,  p: 6,   c: 2,   f: 5,   serving: 200 },

  // ── LATICÍNIOS ───────────────────────────────────────────────
  { id: 'leite_i',   name: 'Leite integral',            cal: 61,  p: 3.2, c: 4.8, f: 3.3, serving: 200 },
  { id: 'leite_d',   name: 'Leite desnatado',           cal: 34,  p: 3.4, c: 4.9, f: 0.1, serving: 200 },
  { id: 'iogurte',   name: 'Iogurte natural integral',  cal: 61,  p: 3.5, c: 4.7, f: 3.3, serving: 180 },
  { id: 'iog_grego', name: 'Iogurte grego',             cal: 97,  p: 9,   c: 3.6, f: 5,   serving: 150 },
  { id: 'mussa',     name: 'Queijo mussarela',          cal: 280, p: 28,  c: 2.2, f: 17,  serving: 30  },
  { id: 'cottage',   name: 'Queijo cottage',            cal: 98,  p: 11,  c: 3.4, f: 4.3, serving: 100 },
  { id: 'requeijao', name: 'Requeijão',                 cal: 247, p: 10,  c: 3.6, f: 21,  serving: 30  },
  { id: 'manteiga',  name: 'Manteiga',                  cal: 717, p: 0.9, c: 0.1, f: 81,  serving: 10  },
  { id: 'creamch',   name: 'Cream cheese',              cal: 342, p: 6,   c: 4.1, f: 34,  serving: 30  },
  // Novos — laticínios
  { id: 'req_light', name: 'Requeijão light',           cal: 150, p: 10,  c: 4,   f: 10,  serving: 30  },
  { id: 'margarina', name: 'Margarina',                 cal: 540, p: 0.5, c: 0.5, f: 60,  serving: 10  },
  { id: 'queijo_c',  name: 'Queijo coalho grelhado',   cal: 300, p: 23,  c: 1.5, f: 22,  serving: 50  },
  { id: 'queijo_p',  name: 'Queijo prato',              cal: 360, p: 24,  c: 1.4, f: 29,  serving: 30  },
  { id: 'leite_cond', name: 'Leite condensado',        cal: 321, p: 7.4, c: 55,  f: 8,   serving: 30  },

  // ── PROTEÍNAS VEGETAIS & LEGUMINOSAS ─────────────────────────
  { id: 'feijao_c',  name: 'Feijão carioca cozido',    cal: 127, p: 8.7, c: 22,  f: 0.5, serving: 150 },
  { id: 'feijao_p',  name: 'Feijão preto cozido',      cal: 132, p: 8.9, c: 24,  f: 0.5, serving: 150 },
  { id: 'lentilha',  name: 'Lentilha cozida',          cal: 116, p: 9,   c: 20,  f: 0.4, serving: 150 },
  { id: 'grao',      name: 'Grão-de-bico cozido',      cal: 164, p: 8.9, c: 27,  f: 2.6, serving: 150 },
  { id: 'tofu',      name: 'Tofu',                     cal: 76,  p: 8,   c: 1.9, f: 4.8, serving: 100 },
  { id: 'ervilha',   name: 'Ervilha cozida',           cal: 84,  p: 5.4, c: 15,  f: 0.4, serving: 100 },
  { id: 'edamame',   name: 'Edamame cozido',           cal: 121, p: 11,  c: 9.9, f: 5.2, serving: 100 },
  { id: 'soja',      name: 'Soja cozida',              cal: 173, p: 17,  c: 10,  f: 9,   serving: 100 },
  { id: 'arrfei',    name: 'Arroz com feijão',         cal: 129, p: 5.8, c: 25,  f: 0.5, serving: 200 },
  // Novos — leguminosas / pratos brasileiros
  { id: 'feij_trp',  name: 'Feijão tropeiro',          cal: 175, p: 10,  c: 22,  f: 6,   serving: 200 },
  { id: 'feijoada',  name: 'Feijoada',                 cal: 160, p: 10,  c: 14,  f: 7,   serving: 250 },
  { id: 'vagem',     name: 'Vagem cozida',             cal: 31,  p: 1.8, c: 7,   f: 0.1, serving: 100 },

  // ── SUPLEMENTOS ──────────────────────────────────────────────
  { id: 'whey',      name: 'Whey protein (pó)',        cal: 400, p: 80,  c: 10,  f: 5,   serving: 30  },
  { id: 'whey_iso',  name: 'Whey isolado (pó)',        cal: 370, p: 88,  c: 3,   f: 0.5, serving: 30  },
  { id: 'albumina',  name: 'Albumina (pó)',            cal: 375, p: 84,  c: 3,   f: 0.5, serving: 30  },
  { id: 'creatina',  name: 'Creatina (pó)',            cal: 0,   p: 0,   c: 0,   f: 0,   serving: 5   },
  { id: 'barra_p',   name: 'Barra de proteína',       cal: 350, p: 30,  c: 35,  f: 8,   serving: 60  },

  // ── FRUTAS ───────────────────────────────────────────────────
  { id: 'banana',    name: 'Banana',                   cal: 89,  p: 1.1, c: 23,  f: 0.3, serving: 120, unitLabel: 'unidade', unitGrams: 120 },
  { id: 'maca',      name: 'Maçã',                     cal: 52,  p: 0.3, c: 14,  f: 0.2, serving: 150, unitLabel: 'unidade', unitGrams: 150 },
  { id: 'laranja',   name: 'Laranja',                  cal: 47,  p: 0.9, c: 12,  f: 0.1, serving: 150, unitLabel: 'unidade', unitGrams: 150 },
  { id: 'manga',     name: 'Manga',                    cal: 60,  p: 0.8, c: 15,  f: 0.4, serving: 150, unitLabel: 'unidade', unitGrams: 150 },
  { id: 'uva',       name: 'Uva',                      cal: 69,  p: 0.7, c: 18,  f: 0.2, serving: 100 },
  { id: 'morango',   name: 'Morango',                  cal: 32,  p: 0.7, c: 7.7, f: 0.3, serving: 100 },
  { id: 'melancia',  name: 'Melancia',                 cal: 30,  p: 0.6, c: 7.6, f: 0.2, serving: 200 },
  { id: 'abacaxi',   name: 'Abacaxi',                  cal: 50,  p: 0.5, c: 13,  f: 0.1, serving: 150 },
  { id: 'abacate',   name: 'Abacate',                  cal: 160, p: 2,   c: 9,   f: 15,  serving: 100 },
  { id: 'mamao',     name: 'Mamão',                    cal: 43,  p: 0.5, c: 11,  f: 0.3, serving: 150 },
  { id: 'pera',      name: 'Pêra',                     cal: 57,  p: 0.4, c: 15,  f: 0.1, serving: 150, unitLabel: 'unidade', unitGrams: 150 },
  { id: 'kiwi',      name: 'Kiwi',                     cal: 61,  p: 1.1, c: 15,  f: 0.5, serving: 80,  unitLabel: 'unidade', unitGrams: 80  },
  { id: 'melao',     name: 'Melão',                    cal: 34,  p: 0.8, c: 8,   f: 0.2, serving: 150 },
  { id: 'mirtilo',   name: 'Mirtilo',                  cal: 57,  p: 0.7, c: 14,  f: 0.3, serving: 80  },
  // Novos — frutas
  { id: 'tangerina', name: 'Tangerina (mexerica)',     cal: 53,  p: 0.8, c: 13,  f: 0.3, serving: 100, unitLabel: 'unidade', unitGrams: 100 },
  { id: 'limao',     name: 'Limão',                    cal: 29,  p: 1.1, c: 9,   f: 0.3, serving: 60,  unitLabel: 'unidade', unitGrams: 60  },
  { id: 'coco_rala', name: 'Coco ralado',              cal: 354, p: 3.3, c: 15,  f: 33,  serving: 30  },

  // ── VERDURAS & LEGUMES ───────────────────────────────────────
  { id: 'batata',    name: 'Batata inglesa cozida',    cal: 87,  p: 1.9, c: 20,  f: 0.1, serving: 150 },
  { id: 'bat_doce',  name: 'Batata doce cozida',       cal: 86,  p: 1.6, c: 20,  f: 0.1, serving: 150 },
  { id: 'cenoura',   name: 'Cenoura',                  cal: 41,  p: 0.9, c: 10,  f: 0.2, serving: 100 },
  { id: 'brocolis',  name: 'Brócolis',                 cal: 34,  p: 2.8, c: 7,   f: 0.4, serving: 100 },
  { id: 'espinafre', name: 'Espinafre',                cal: 23,  p: 2.9, c: 3.6, f: 0.4, serving: 100 },
  { id: 'alface',    name: 'Alface',                   cal: 15,  p: 1.4, c: 2.9, f: 0.2, serving: 50  },
  { id: 'tomate',    name: 'Tomate',                   cal: 18,  p: 0.9, c: 3.9, f: 0.2, serving: 100, unitLabel: 'unidade', unitGrams: 100 },
  { id: 'cebola',    name: 'Cebola',                   cal: 40,  p: 1.1, c: 9.3, f: 0.1, serving: 50  },
  { id: 'pepino',    name: 'Pepino',                   cal: 16,  p: 0.7, c: 3.6, f: 0.1, serving: 100 },
  { id: 'couve',     name: 'Couve-flor',               cal: 25,  p: 1.9, c: 5,   f: 0.3, serving: 100 },
  { id: 'abobrinha', name: 'Abobrinha',                cal: 17,  p: 1.2, c: 3.1, f: 0.3, serving: 100 },
  { id: 'beterraba', name: 'Beterraba cozida',         cal: 44,  p: 1.7, c: 10,  f: 0.2, serving: 100 },
  // Novos — verduras / legumes brasileiros
  { id: 'couve_r',   name: 'Couve refogada',           cal: 50,  p: 3.5, c: 5,   f: 2,   serving: 60  },
  { id: 'quiabo',    name: 'Quiabo cozido',            cal: 33,  p: 2,   c: 7,   f: 0.2, serving: 100 },
  { id: 'jilo',      name: 'Jiló refogado',            cal: 28,  p: 1.5, c: 5.5, f: 0.3, serving: 100 },
  { id: 'vinagrete', name: 'Vinagrete',                cal: 40,  p: 0.8, c: 4,   f: 2.5, serving: 80  },
  { id: 'mandioca',  name: 'Mandioca cozida',          cal: 125, p: 1,   c: 30,  f: 0.3, serving: 150 },
  { id: 'maxixe',    name: 'Maxixe cozido',            cal: 20,  p: 1.5, c: 3.5, f: 0.2, serving: 100 },

  // ── GORDURAS & OLEAGINOSAS ───────────────────────────────────
  { id: 'amendoim',  name: 'Amendoim',                 cal: 567, p: 26,  c: 16,  f: 49,  serving: 30  },
  { id: 'cast_b',    name: 'Castanha-do-pará',         cal: 659, p: 14,  c: 12,  f: 66,  serving: 20, unitLabel: 'unidade', unitGrams: 5  },
  { id: 'amendoa',   name: 'Amêndoa',                  cal: 579, p: 21,  c: 22,  f: 50,  serving: 30  },
  { id: 'nozes',     name: 'Nozes',                    cal: 654, p: 15,  c: 14,  f: 65,  serving: 30  },
  { id: 'pasta_a',   name: 'Pasta de amendoim',        cal: 588, p: 25,  c: 20,  f: 50,  serving: 30  },
  { id: 'azeite',    name: 'Azeite de oliva',          cal: 884, p: 0,   c: 0,   f: 100, serving: 10  },
  { id: 'chia',      name: 'Semente de chia',          cal: 486, p: 17,  c: 42,  f: 31,  serving: 15  },
  { id: 'linhaca',   name: 'Linhaça',                  cal: 534, p: 18,  c: 29,  f: 42,  serving: 15  },
  // Novos — gorduras
  { id: 'oleo_soja', name: 'Óleo de soja',             cal: 884, p: 0,   c: 0,   f: 100, serving: 10  },

  // ── LANCHES & FAST-FOOD ──────────────────────────────────────
  { id: 'coxinha',   name: 'Coxinha',                  cal: 260, p: 11,  c: 28,  f: 12,  serving: 80, unitLabel: 'unidade', unitGrams: 80  },
  { id: 'pastel',    name: 'Pastel de carne',          cal: 290, p: 10,  c: 34,  f: 13,  serving: 100, unitLabel: 'unidade', unitGrams: 100 },
  { id: 'esfirra',   name: 'Esfiha',                   cal: 220, p: 8,   c: 27,  f: 9,   serving: 70, unitLabel: 'unidade', unitGrams: 70  },
  { id: 'hamburguer', name: 'Hambúrguer (pão + carne)', cal: 295, p: 17, c: 28,  f: 12,  serving: 170, unitLabel: 'unidade', unitGrams: 170 },

  // ── OUTROS ──────────────────────────────────────────────────
  { id: 'mel',       name: 'Mel',                      cal: 304, p: 0.3, c: 82,  f: 0,   serving: 20  },
  { id: 'acucar',    name: 'Açúcar',                   cal: 387, p: 0,   c: 100, f: 0,   serving: 10  },
  { id: 'choc_am',   name: 'Chocolate amargo 70%',    cal: 604, p: 8,   c: 46,  f: 43,  serving: 30  },
  { id: 'biscoito',  name: 'Biscoito integral',        cal: 430, p: 8,   c: 70,  f: 14,  serving: 30  },
  { id: 'leite_am',  name: 'Leite de amêndoa',        cal: 13,  p: 0.4, c: 0.3, f: 1.1, serving: 200 },
  { id: 'suco_l',    name: 'Suco de laranja natural',  cal: 45,  p: 0.7, c: 10,  f: 0.2, serving: 200 },
  { id: 'cafe_p',    name: 'Café preto',               cal: 2,   p: 0.3, c: 0,   f: 0,   serving: 200 },
  { id: 'cafe_lm',   name: 'Café com leite',           cal: 31,  p: 1.6, c: 2.4, f: 1.6, serving: 200 },
  { id: 'vitam_b',   name: 'Vitamina de banana',       cal: 95,  p: 3.2, c: 18,  f: 1.5, serving: 250 },
  { id: 'pizza_sl',  name: 'Pizza (fatia média)',      cal: 266, p: 11,  c: 33,  f: 10,  serving: 100, unitLabel: 'fatia',   unitGrams: 100 },
  { id: 'tapioca_r', name: 'Tapioca recheada',        cal: 180, p: 3.5, c: 38,  f: 2,   serving: 130 },
  // Novos — outros
  { id: 'suco_caj',  name: 'Suco de caju natural',    cal: 44,  p: 0.9, c: 10,  f: 0.3, serving: 200 },
  { id: 'refriger',  name: 'Refrigerante (cola)',     cal: 41,  p: 0,   c: 11,  f: 0,   serving: 350 },
  { id: 'pao_alho',  name: 'Pão de alho (fatia)',     cal: 320, p: 7,   c: 42,  f: 14,  serving: 60, unitLabel: 'fatia',   unitGrams: 60  },
  { id: 'escondidinho', name: 'Escondidinho',         cal: 145, p: 9,   c: 14,  f: 6,   serving: 300 },
  { id: 'acai',      name: 'Açaí com banana',         cal: 110, p: 2,   c: 18,  f: 4,   serving: 200 },
  { id: 'maionese',  name: 'Maionese',                cal: 680, p: 1.1, c: 2.8, f: 74,  serving: 15  },
  { id: 'ketchup',   name: 'Ketchup',                 cal: 100, p: 1.3, c: 24,  f: 0.1, serving: 15  },
  { id: 'caldo_cana', name: 'Caldo de cana',          cal: 54,  p: 0.2, c: 13,  f: 0.1, serving: 300 },
  { id: 'mingau',    name: 'Mingau de aveia',         cal: 72,  p: 3,   c: 12,  f: 1.5, serving: 200 },
  { id: 'iog_fruta', name: 'Iogurte de fruta',        cal: 80,  p: 4,   c: 14,  f: 1.2, serving: 170, unitLabel: 'unidade', unitGrams: 170 },
  { id: 'pamonha',   name: 'Pamonha',                 cal: 180, p: 3,   c: 36,  f: 3.5, serving: 150, unitLabel: 'unidade', unitGrams: 150 },
  { id: 'brigadeiro', name: 'Brigadeiro',             cal: 130, p: 1.5, c: 22,  f: 4,   serving: 30,  unitLabel: 'unidade', unitGrams: 30  },
  { id: 'fruta_pao', name: 'Fruta-pão cozida',        cal: 103, p: 1.1, c: 27,  f: 0.2, serving: 100 },
]

export function searchFoods(query: string, limit = 10): FoodDBItem[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return FOOD_DB.filter(f => {
    const name = f.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return name.includes(q)
  }).slice(0, limit)
}
