import express from "express"
import mysql from "mysql"
import cors from "cors"


const app = express()
app.use(express.json())
app.use(cors())

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "619123",
  database: "ders_programi",

})

// Index page get request
app.get("/", (req, res) => {
  res.json("hello this isss the backend")
})

// Dersler get request
app.get("/dersler", (req, res) => {
  const q = "SELECT * FROM ders_programi.dersler"
  db.query(q, (err, data) => {
    if (err) return res.json(err)
    return res.json(data)
  })
})

// Hocalar get request 
app.get("/hocalar", (req, res) => {
  const q = "SELECT * FROM ders_programi.hocalar"
  db.query(q, (err, data) => {
    if (err) return res.json(err)
    return res.json(data)
  })
})

// Sınıflar get request
app.get("/siniflar", (req, res) => {
  const q = "SELECT * FROM ders_programi.siniflar"
  db.query(q, (err, data) => {
    if (err) return res.json(err)
    return res.json(data)
  })
})

// app.get("/dersprogrami", (req, res) => {

//   const q = "SELECT * FROM ders_programi.dersprogrami";

//   db.query(q, (err, data) => {
//     if (err) return res.json(err);

//     const promises = data.map(item => {
//       return new Promise((resolve, reject) => {
//         const hocaId = item.HocaID;
//         const hocaQuery = `SELECT HocaAd i FROM ders_programi.hocalar WHERE HocaID = ${hocaId}`;

//         db.query(hocaQuery, (hocaErr, hocaData) => {
//           if (hocaErr) {
//             reject(hocaErr);
//           } else {
//             const hocaIsmi = hocaData[0] ? hocaData[0].HocaAdi : null;
//             console.log("hocaData: ", hocaIsmi)
//             item.hoca_Ismi = hocaIsmi;
//             resolve(item);
//           }
//         });
//       });
//     });

//     Promise.all(promises)
//       .then(result => {
//         res.json(result);
//       })
//       .catch(error => {
//         res.json(error);
//       });
//   });
// });

// Ders programi get request
app.get("/dersprogrami", (req, res) => {
  const dersProgramiQuery = "SELECT * FROM ders_programi.dersprogrami";

  db.query(dersProgramiQuery, (dersProgramiErr, dersProgramiData) => {
    if (dersProgramiErr) return res.json(dersProgramiErr);

    const promises = dersProgramiData.map(item => {
      return new Promise((resolve, reject) => {
        const hocaId = item.HocaID;
        const sinifId = item.SinifID;
        const dersId = item.DersID;

        const hocaQuery = `SELECT HocaAdi FROM ders_programi.hocalar WHERE HocaID = ${hocaId}`;
        const sinifQuery = `SELECT SinifAdi FROM ders_programi.siniflar WHERE SinifID = ${sinifId}`;
        const dersQuery = `SELECT DersAdi FROM ders_programi.dersler WHERE DersID = ${dersId}`;

        db.query(hocaQuery, (hocaErr, hocaData) => {
          if (hocaErr) {
            reject(hocaErr);
          } else {
            const hocaIsmi = hocaData[0] ? hocaData[0].HocaAdi : null;
            item.hocaAdi = hocaIsmi;

            db.query(sinifQuery, (sinifErr, sinifData) => {
              if (sinifErr) {
                reject(sinifErr);
              } else {
                const sinifAdi = sinifData[0] ? sinifData[0].SinifAdi : null;
                item.sinifAdi = sinifAdi;

                db.query(dersQuery, (dersErr, dersData) => {
                  if (dersErr) {
                    reject(dersErr);
                  } else {
                    const dersAdi = dersData[0] ? dersData[0].DersAdi : null;
                    item.dersAdi = dersAdi;

                    resolve(item);
                  }
                });
              }
            });
          }
        });
      });
    });

    Promise.all(promises)
      .then(result => {
        res.json(result);
      })
      .catch(error => {
        res.json(error);
      });
  });
});

// Ders Programı create post request
app.post('/dersprogrami/create', (req, res) => {
  const { HocaID, DersID, Gun, Saat, SinifID } = req.body;

  // cakisan dersleri kontrol
  const overlapCheckQuery = `
    SELECT * FROM ders_programi.dersprogrami
    WHERE Gun = ? AND Saat = ?
  `;

  db.query(overlapCheckQuery, [Gun, Saat], (overlapErr, overlapResults) => {
    if (overlapErr) {
      console.error(overlapErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // cakisma varsa error ver
    if (overlapResults.length > 0) {
      return res.status(400).json({ error: 'Overlapping schedule detected' });
    }

    //cakisma yoksa devam
    const insertQuery = `
      INSERT INTO ders_programi.dersprogrami (HocaID, DersID, Gun, Saat, SinifID)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [HocaID, DersID, Gun, Saat, SinifID];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ message: 'Ders programı created successfully', id: result.insertId });
    });
  });
});

// Ders Programı delete request
app.delete('/dersprogrami/delete/:ProgramID', (req, res) => {
  const programId = req.params.ProgramID;

  const deleteQuery = `
    DELETE FROM ders_programi.dersprogrami
    WHERE ProgramID = ?
  `;

  db.query(deleteQuery, [programId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Ders programı deleted successfully' });
  });
});

// Ders Programı edit (update) request
app.put('/dersprogrami/update/:ProgramID', (req, res) => {
  const programId = req.params.ProgramID;
  const { HocaID, DersID, SinifID, Gun, Saat } = req.body;

  // cakisan ders var mi kontrol
  const overlapCheckQuery = `
    SELECT * FROM ders_programi.dersprogrami
    WHERE Gun = ? AND Saat = ? AND ProgramID != ?
  `;

  db.query(overlapCheckQuery, [Gun, Saat, programId], (overlapErr, overlapResults) => {
    if (overlapErr) {
      console.error(overlapErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // cakisma varsa error dondur
    if (overlapResults.length > 0) {
      return res.status(400).json({ error: 'Overlapping schedule detected' });
    }

    // cakisma yoksa update et
    const updateQuery = `
      UPDATE ders_programi.dersprogrami
      SET HocaID = ?, DersID = ?, SinifID = ?, Gun = ?, Saat = ?
      WHERE ProgramID = ?
    `;

    const updateValues = [HocaID, DersID, SinifID, Gun, Saat, programId];

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json({ message: 'Ders programı updated successfully' });
    });
  });
});

app.listen(8800, () => {
  console.log("connected to backend!!!224422")
})
