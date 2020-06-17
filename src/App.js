import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      empresas: [],
      empresaSelecionada: null,
      qtdNotas: null,
      qtdDebitos: null,
      mensagemErro: null,
      mensagemSucessoImportacao: null,
    };
  }

  componentDidMount() {
    axios.get(`http://localhost:8080/empresas`)
      .then(res => {
        const empresas = res.data;
        this.setState({ empresas: empresas, empresaSelecionada: empresas[0].id });
        console.log(empresas);
      })
  }

  handleMudancaEmpresa(e) {
    this.setState({ empresaSelecionada: e.target.value });
  }

  async onClickImportar() {
    if (!this.state.qtdNotas || !this.state.qtdDebitos) {
      this.setState({ mensagemErro: 'Informe um arquivo!' });
    }

    this.setState({ qtdNotas: null, qtdDebitos: null });

    try {
      await axios.post('http://localhost:8080/registrofinanceiro',
        {
          idEmpresa: this.state.empresaSelecionada,
          qtdNotas: this.state.qtdNotas,
          qtdDebitos: this.state.qtdDebitos,
        })
      this.setState({ mensagemSucessoImportacao: 'Arquivo importado com sucesso' });
      await this.buscarRankingConfiabilidade();
    } catch (error) {
      console.log(error);
    }
  }

  async buscarRankingConfiabilidade() {
    const response = await axios.get('http://localhost:8080/empresas');
    const empresas = response.data;
    this.setState({ empresas: empresas });
  }

  handleArquivoEscolhido(file) {
    if (file) {
      this.setState({ mensagemErro: null });
      const fileReader = new FileReader();
      fileReader.onloadend = (e) => this.handleArquivoLido(e);
      fileReader.readAsText(file);
    }
  }

  handleArquivoLido(e) {
    const content = e.target.result;
    console.log(content);
    const notasEDebitos = content.split(';');
    const qtdNotas = notasEDebitos[0];
    const qtdDebitos = notasEDebitos[1];
    this.setState({ qtdNotas, qtdDebitos });
  }

  render() {
    return (
      <div className="App">
        <div>
          <label>Selecione a Empresa: </label>
          <select onChange={e => this.handleMudancaEmpresa(e)}>
            {this.state.empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Selecione o arquivo de importação: </label>
          <input type='file'
            accept='.txt'
            onChange={e => this.handleArquivoEscolhido(e.target.files[0])}
            onClick={(event) => {
              event.target.value = null
              this.setState({ qtdNotas: null, qtdDebitos: null });
            }}
          />
          {this.state.mensagemErro &&
            <h3> {this.state.mensagemErro} </h3>}
        </div>

        <div className='botaoImportar'>
          <button onClick={() => this.onClickImportar()}>Importar</button>
          {this.state.mensagemSucessoImportacao &&
            <h3> {this.state.mensagemSucessoImportacao} </h3>}
        </div>

        <div>
          <table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Reputação (%)</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.empresas.map(empresa => (
                  <tr>
                    <td>{empresa.nome}</td>
                    <td>{empresa.reputacao}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}

export default App;
