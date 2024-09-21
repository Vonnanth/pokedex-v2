// Como só existe algumas cores de pokemons, usarei essa função que retorna as cores geradas por IA
const get_color_pokemon = () => {
    return [
        '#61ca56', '#0be12d', '#e4e92d', '#aa7b31', '#9cbb5d',
        '#a3e3d6', '#c2255b', '#3551b9', '#eb9d1c', '#015aa2',
        '#64c353', '#f6a05e', '#50964d', '#5f14e9', '#639061',
        '#0d28d0', '#595a12', '#db7ecf', '#abb85b', '#326aeb',
        '#192f7d', '#2c8a8d', '#e2f6b8', '#d2579f', '#a540c3',
        '#8beabf', '#0cdb41', '#898cde', '#58520b', '#1ec40f',
        '#b4f12d', '#ed5edc', '#d30cb7', '#95e019', '#fc6bea',
        '#b141a7', '#61904e', '#fc3568', '#7e458b', '#fbe320',
        '#42389c', '#5dff57', '#ed742d', '#1fd2aa', '#f9a468',
        '#0e0196', '#820221', '#139b16', '#8c9e38', '#a4046d',
        '#ea84ca', '#603964', '#932f98', '#a545c5', '#81fb86',
        '#67927e', '#64f535', '#907c34', '#f5905b', '#e95450',
        '#8177cc', '#08132b', '#fdfc16', '#0aa552', '#89b620',
        '#a2a3cb', '#695ff3', '#7f1a1e', '#b56ba8', '#76f629',
        '#e7c3af', '#ab214b', '#27e9f4', '#1da3c7', '#dbc99b',
        '#1343a9', '#16e855', '#ce9ddc', '#07c14f', '#bf366d',
        '#1cd078', '#6df614', '#ea46ef', '#4ef75e', '#94fedc',
        '#18627b', '#f496df', '#8f6660', '#31a15a', '#43767b',
        '#dc3681', '#6d5970', '#2e79b7', '#e271bd', '#43bfeb',
        '#0a6e6e', '#cb5684', '#c03f37', '#f305c1', '#3f83cf'
    ]
}

const get_pokemon_info = async (id) => {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)

    if (!data.ok)
        return null;

    const response = await data.json();
    return response;
}

const get_pokemon_desc = async (id) => {
    const data = await fetch(`https://pokeapi.co/api/v2/characteristic/${id}/`);

    if (!data.ok)
        return null;

    const response = await data.json();
    return response.descriptions[7].description;
}

const get_pokemons_data = async (limit, offset) => {
    let pokemons_data = [];
    for (let i = offset+1; i < limit+1; i++) {
        const poke_info =  await get_pokemon_info(i);
        // const poke_desc = await get_pokemon_desc(i);

        pokemons_data[i] = {
            name: poke_info.name,
            color: get_color_pokemon()[i],
            info: poke_info,
            // descriptions: poke_desc
        }
    }

    render_pokemons(pokemons_data, limit, offset);
};

const render_pokemons = (poke_data, limit, offset) => {
    $(poke_data).each(function(index, pokemon) {
        if (pokemon != null) {
            $('#list-pokemons').append(`
                <li class="list-group-item d-flex justify-content-center col-12 col-md-6 col-lg-3 mb-4 slideInLeft" id="poke-${index}">
                    <div class="card shadow bg-body-tertiary rounded" style="width: 18rem;">
                        <button class="btn-card-poke btn p-0" data-poke-id="${pokemon.info.id}" data-bs-toggle="modal" data-bs-target="#modal-details-pokemon">
                            <h5 class="card-title fw-light p-2 text-end">#${pokemon.info.id}</h5>
                            <img src="${pokemon.info.sprites.front_default}" class="card-img-top z-3" alt="pokemon-image">
                            <div class="card-body rounded-top w-100 d-flex flex-column justify-content-end" style="background-color: #f2f2f2; height: 80px !important; margin-top: -40px">
                                <h5 class="fw-bold">${pokemon.name}</h5>
                                <!-- <p class="card-text text-center">${pokemon.descriptions ?? 'Sem informações'}</p> -->
                            </div>
                        </button>
                    </div>
                </li>
            `)
        }
    });

    observar_elemento(limit, offset);
}

const get_pokemon_details = async (id) => {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const habitat = await fetch(`https://pokeapi.co/api/v2/pokemon-habitat/${id}/`)
    const poke_desc = await get_pokemon_desc(id);

    if (!data.ok)
        return null;
    else {
        data.json().then(function(value) {
            const poke_img = value.sprites.other.dream_world.front_default ?? value.sprites.front_default;
            const poke_abi1 = value.abilities[0];
            const poke_abi2 = value.abilities[1];

            $('#modal-title').text(value.name.toUpperCase());
            $('#pokemon-image').attr('src', poke_img);
            $('#poke-type').text(value.types[0].type.name);
            $("#poke-weight").text(value.weight);
            $("#poke-height").text(value.height);
            $('#poke-ability-1').text(capitalize(poke_abi1 != null ? poke_abi1.ability.name : ''));
            $('#poke-ability-2').text(capitalize(poke_abi2 != null ? poke_abi2.ability.name : ''));
            $('#poke-description').text(poke_desc);
            $('#poke-hp').css('width', `${value.stats[0].base_stat}%`);
            $('#poke-hp-value').text(value.stats[0].base_stat);
            $('#poke-atk').css('width', `${value.stats[1].base_stat}%`);
            $('#poke-atk-value').text(value.stats[1].base_stat);
            $('#poke-def').css('width', `${value.stats[2].base_stat}%`);
            $('#poke-def-value').text(value.stats[2].base_stat);
            $('#poke-satk').css('width', `${value.stats[3].base_stat}%`);
            $('#poke-satk-value').text(value.stats[3].base_stat);
            $('#poke-sdef').css('width', `${value.stats[4].base_stat}%`);
            $('#poke-sdef-value').text(value.stats[4].base_stat);
            $('#poke-spd').css('width', `${value.stats[5].base_stat}%`);
            $('#poke-spd-value').text(value.stats[5].base_stat);
        });

        if (habitat.ok) {
            const habitat_response = await habitat.json();
            $('#poke-habitat').text(habitat_response.name);
        } else 
            $('#poke-habitat').text('Not Found...');
    }
}

const observar_elemento = (limit, offset) => {
    const observar = () => {
        let target = $(`#list-pokemons li:last`); // Pega o último elemento da lista

        if (target.length === 0) {
            return;
        }

        let scrollPosition = $(window).scrollTop(); // Posição atual do scroll
        let windowHeight = $(window).height(); // Altura da janela (viewport)
        let elementPosition = target.offset().top; // Posição do elemento em relação ao topo da página

        // Verifica se o elemento está visível na viewport
        if (scrollPosition + windowHeight > elementPosition) {
            limit += 12;
            offset += 12;
            get_pokemons_data(limit, offset);

            target = $(`#poke-${limit}`);
            
            // Remove o event listener do scroll para evitar execuções repetidas
            $(window).off('scroll', observar);

            // Adiciona o listener de novo para o novo elemento
            setTimeout(() => {
                observar_elemento(limit, offset); // Chama a função novamente para observar o próximo elemento
            }, 1000); // Atraso opcional, para evitar execuções rápidas demais
        }
    };

    // Adiciona o event listener para o scroll
    $(window).on('scroll', observar);
}

const limpar_modal = () => {
    $('#modal-title').text('');
    $('#pokemon-image').attr('src', '');
    $('#poke-type').text('');
    $('#poke-habitat').text('');
    $("#poke-weight").text('');
    $("#poke-height").text('');
    $('#poke-ability-1').text('');
    $('#poke-ability-2').text('');
    $('#poke-description').text('');
    $('#poke-hp').css('width', `0%`);
    $('#poke-hp-value').text('');
    $('#poke-atk').css('width', `0%`);
    $('#poke-atk-value').text('');
    $('#poke-def').css('width', `0%`);
    $('#poke-def-value').text('');
    $('#poke-satk').css('width', `0%`);
    $('#poke-satk-value').text('');
    $('#poke-sdef').css('width', `0%`);
    $('#poke-sdef-value').text('');
    $('#poke-spd').css('width', `0%`);
    $('#poke-spd-value').text('');
}

const search_pokemon = (name) => {
    const url = 'https://beta.pokeapi.co/graphql/v1beta';
    const query = `
        query {
            pokemon_v2_pokemon(where: { name: {_ilike: "%${name}%"} }) {
                id
                name
            }
        }
    `;

    $('#search-pokemon-modal').modal('hide');
    $('#input-name-pokemon').val('');

    // Show loading while request is being made
    Swal.fire({
        icon: 'info',
        title: 'Searching...',
        allowOutsideClick: false
    });
    Swal.showLoading();

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        // Close the loading indicator
        Swal.close();
        
        const poke_data = data.data.pokemon_v2_pokemon;
        if (poke_data.length != 0) {
            $('#ul-modal-results').empty();
            $(poke_data).each(function(index, value) {
                $('#ul-modal-results').append(`
                    <li class="list-group-item">
                        <button class="btn btn-poke-modal-result" data-poke-id-result="${value.id}" data-bs-toggle="modal" data-bs-target="#modal-details-pokemon">${value.name}</button>
                    </li>
                `)
            });
            
            $('#modal-results-search').modal('show');
        } else {
            Swal.fire('Opps..', 'Pokemon not found', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const capitalize = (string) =>  {
    return string.charAt(0).toUpperCase() + string.slice(1);
}