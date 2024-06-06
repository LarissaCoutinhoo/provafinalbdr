const { createApp } = Vue;
const API_URL = 'https://lunavssolar.netlify.app';

createApp({
    data() {
        return {
            heroiVida: 100,
            vilaoVida: 100            
        };        
    },
    methods: {
        async atacar(isHeroi) {
            if (isHeroi) {
                this.vilaoVida -= 10;
                this.atualizarVidaNoBancoDeDados(this.heroiVida, this.vilaoVida);
                this.acaoVilao();
            } else {
                this.heroiVida -= 20;
                this.atualizarVidaNoBancoDeDados(this.vilaoVida, this.heroiVida);
            }
        },
        async atualizarVidaNoBancoDeDados(vidaHeroi, vidaVilao) {
            try {
                const response = await fetch(`${API_URL}/atualizarVida`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ vidaHeroi, vidaVilao })
                });
                if (!response.ok) {
                    throw new Error('Erro ao atualizar a vida no banco de dados.');
                }
                console.log('Vida do herói e do vilão atualizada com sucesso.');
            } catch (error) {
                console.error('Erro ao atualizar a vida no banco de dados:', error);
            }
        },
        acaoVilao() {
            const acoes = ['atacar', 'defender', 'usarPocao', 'correr'];
            const acaoAleatoria = acoes[Math.floor(Math.random() * acoes.length)];
            this[acaoAleatoria](false);
            console.log('O vilão usou: ' + acaoAleatoria);
        },
        async defender(isHeroi) {
            this.acaoVilao();
        },
        async usarPocao(isHeroi) {
            if (isHeroi) {
                this.vilaoVida += 10;
                this.atualizarVidaNoBancoDeDados(this.heroiVida, this.vilaoVida);
                this.acaoVilao();
            } else {
                this.heroiVida += 10;
                this.atualizarVidaNoBancoDeDados(this.vilaoVida, this.heroiVida);
            }
        },
        async correr(isHeroi) {
            this.acaoVilao();
        }
    }
}).mount("#app"); 