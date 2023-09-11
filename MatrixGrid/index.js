import React, {Component} from "react";
// import 'react-data-grid/lib/styles.css';
// import DataGrid from 'react-data-grid';

class DataGrid extends Component {
    render() {
        return <div>DataGrid</div>
    }
}

class CellMatrix {

    left = undefined
    right = undefined
    top = undefined
    bottom = undefined

}

class Matrix {


}

export class MatrixGrid extends Component {
    columns = [
        { key: 'id', name: 'ID' },
        { key: 'title', name: 'Title' }
    ];

    rows = [
        { id: 0, title: 'Example' },
        { id: 1, title: 'Demo' }
    ];

    constructor(props) {
        super(props);

        this.state = {
            data: new Matrix()
        }
    }

    render() {
        return (
            <div>
            <DataGrid columns={this.columns} rows={this.rows} />
            </div>)
    }
}
