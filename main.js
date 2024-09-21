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

        pokemons_data[i] = {
            name: poke_info.name,
            color: get_color_pokemon()[i],
            info: poke_info,
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
        let target = $(`#list-pokemons li:last`);

        if (target.length === 0) {
            return;
        }

        let scrollPosition = $(window).scrollTop();
        let windowHeight = $(window).height();
        let elementPosition = target.offset().top;

        if (scrollPosition + windowHeight > elementPosition) {
            limit += 12;
            offset += 12;
            get_pokemons_data(limit, offset);

            target = $(`#poke-${limit}`);
            
            $(window).off('scroll', observar);

            setTimeout(() => {
                observar_elemento(limit, offset)
            }, 1000);
        }
    };

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