const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'AdmSql159357!',
    database: 'mega'
});
const model = {};
model.getAll = async (table)=>{
    let sql = `select * from ${table};`;
    return new Promise((res,rej)=>{
        pool.getConnection((err,conn)=>{
            if(err) rej(err);
            conn.query(sql, (err,rows)=>{
                if(err) rej(err);
                else res(rows);
                conn.release();
            });
        });
    });
};
model.get = async (table, id)=>{    
    sql = mysql.format(`select * from ${table} where id=?`,[id]);
    return new Promise((res,rej)=>{
        pool.getConnection((err,conn)=>{
            if(err) rej(err);
            else conn.query(sql, (err,rows)=>{
                if(err) rej(err);
                else if(rows && rows.length>0) res(rows[0]);
                else res(null);
                conn.release();
            });
        });
    });
};
model.query = async (sql, params)=>{
    if(params)
        sql = mysql.format(sql,params);
    return new Promise((res,rej)=>{
        pool.getConnection((err,conn)=>{
            if(err) rej(err);
            else conn.query(sql, (err,rows)=>{
                if(err) rej(err);
                else res(rows);
                conn.release();
            });
        });
    });
};
model.add = async (table, obj)=>{
    // let keys = Object.keys(obj);
    // let sql = `insert into ${table} (${keys.join(',')}) values (${keys.map((k)=>'?').join(',')});`;
    // sql = mysql.format(sql, keys.map((k)=>obj[k]));
    return new Promise((res,rej)=>{
        pool.getConnection((err,conn)=>{
            if(err) rej(err);
            conn.query(`INSERT INTO ${table} SET ?`,obj, (err,rs)=>{
                if(err) rej(err);
                else {
                    // if(!Array.isArray(obj)){
                    //     obj.id = rs.insertId;
                    // }else{
                    //     for(var o of obj){
                    //         obj.id = rs.insertId;
                    //     }
                    // }
                    obj.id = rs.insertId;
                    res(obj);
                }
                conn.release();
            });
        });
    });
};
module.exports = model;
