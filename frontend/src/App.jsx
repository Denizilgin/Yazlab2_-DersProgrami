import { useState, useEffect } from 'react';
import './App.css';
import { Select, Label, Modal } from 'flowbite-react';
import { PiPlusBold } from "react-icons/pi";
import axios from 'axios'


function App() {
  const [data, setData] = useState([]);
  const [dersler, setDersler] = useState([]);
  const [hocalar, setHocalar] = useState([]);
  const [siniflar, setSiniflar] = useState([]);
  const [ders, setDers] = useState('');
  const [hoca, setHoca] = useState('');
  const [sinif, setSinif] = useState('');
  const [gun, setGun] = useState('');
  const [saat, setSaat] = useState('');
  const [programID, setProgramID] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
  const saatler = ["08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00", "16:00:00"];

  useEffect(() => {
    const fetchData = async (url, setter) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchAllData = async () => {
      await Promise.all([
        fetchData('http://localhost:8800/dersprogrami', setData),
        fetchData('http://localhost:8800/dersler', setDersler),
        fetchData('http://localhost:8800/siniflar', setSiniflar),
        fetchData('http://localhost:8800/hocalar', setHocalar),
      ]);
    };

    fetchAllData();
  }, []);

  function onCloseModal() {
    setDers('')
    setHoca('')
    setSinif('')
    setGun('')
    setSaat('')
    setOpenModal(false);
  }

  function onCloseUpdateModal() {
    setDers('')
    setHoca('')
    setSinif('')
    setGun('')
    setSaat('')
    setProgramID('')
    setOpenUpdateModal(false);
  }

  const dersVarMi = (gun, saat) => {
    return data.some((ders) => ders.Gun === gun && ders.Saat === saat);
  };

  const handleTable = () => {
    return saatler.map((saat, index) => (
      <tr key={index} className="bg-[#444] border-b dark:bg-[#444] dark:border-gray-700">
        <td className='py-2 px-3 border bg-[#333] text-gray-300'>{saat}</td>
        {gunler.map(gun => (
          <td key={gun} className="px-6 py-4 border items-center text-center">
            {
              dersVarMi(gun, saat) ? (
                data
                  .filter((ders) => ders.Gun === gun && ders.Saat === saat)
                  .map((ders, index) => (
                    <div key={index} className='flex flex-col text-center cursor-pointer' onClick={() => handleOpenUpdateModal(ders.ProgramID, ders.DersID, ders.HocaID, ders.SinifID, ders.Gun, ders.Saat)}>
                      <p>{ders.dersAdi}</p>
                      <p>{ders.hocaAdi}</p>
                      <p>{ders.sinifAdi}</p>
                    </div>
                  ))
              ) : (
                <button className='px-3 py-3 text-white bg-[#333] rounded-full' onClick={() => handleOpenModal(gun, saat)}>
                  <PiPlusBold />
                </button>
              )
            }
          </td>
        ))}
      </tr>
    ));
  };

  const handleOpenModal = (gun, saat) => {
    setGun(gun);
    setSaat(saat);
    setOpenModal(true);
  }

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8800/dersprogrami/create', {
        DersID: ders,
        HocaID: hoca,
        SinifID: sinif,
        Gun: gun,
        Saat: saat
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  };

  const handleOpenUpdateModal = (program, ders, hoca, sinif, gun, saat) => {
    setProgramID(program)
    setDers(ders)
    setHoca(hoca)
    setSinif(sinif)
    setGun(gun);
    setSaat(saat);
    setOpenUpdateModal(true);
  }

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:8800/dersprogrami/delete/${programID}`);

      console.log(response.data);
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  }

  const handleUpdateSubmit = async () => {
    try {
      const response = await axios.put(`http://localhost:8800/dersprogrami/update/${programID}`, {
        DersID: ders,
        HocaID: hoca,
        SinifID: sinif,
        Gun: gun,
        Saat: saat
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  }

  return (
    <div>
      <div className="grid place-items-center min-h-screen py-24 text-white font-semibold bg-[#2b2a2a]">
        <div className=''>
          <table className="w-full text-sm text-white">
            <thead className="text-xs text-gray-300 uppercase bg-[#333] dark:bg-[#333]">
              <tr>
                <td className='py-2 px-3 border'></td>
                {gunler.map((item, index) => (
                  <td key={index} className='py-4 px-3 text-lg text-center border'>{item}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {handleTable()}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={openModal} size="md" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <form action="" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Ders detaylarını seçin:</h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="DersID" value="Ders Adı Seçiniz" />
                </div>
                <Select name="DersID" onChange={(e) => setDers(e.target.value)}>
                  <option disabled selected>Lütfen Ders Seçiniz</option>
                  {dersler.map((item) => (
                    <option key={item.DersID} value={item.DersID}>{item.DersAdi}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="HocaID" value="Hoca Adı Seçiniz" />
                </div>
                <Select name="HocaID" onChange={(e) => setHoca(e.target.value)}>
                  <option disabled selected>Lütfen Hoca Seçiniz</option>
                  {hocalar.map((item) => (
                    <option key={item.HocaID} value={item.HocaID}>{item.HocaAdi}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="SinifID" value="Sınıf Adı Seçiniz" />
                </div>
                <Select name="SinifID" onChange={(e) => setSinif(e.target.value)}>
                  <option disabled selected>Lütfen Sınıf Seçiniz</option>
                  {siniflar.map((item) => (
                    <option key={item.SinifID} value={item.SinifID}>{item.SinifAdi}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="Gun" value="Gun Seçiniz" />
                </div>
                <Select name="Gun" onChange={(e) => setGun(e.target.value)} value={gun}>
                  <option disabled selected>{gun}</option>
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="Saat" value="Saat Seçiniz" />
                </div>
                <Select name="Saat" onChange={(e) => setSaat(e.target.value)} value={saat}>
                  <option disabled selected>{saat}</option>
                </Select>
              </div>
              <div className="w-full flex justify-center">
                <button type="submit" className="w-full text-white">
                  Ekle
                </button>
              </div>
            </div>
          </form>

        </Modal.Body>
      </Modal>

      {/* UPDATE MODAL */}
      <Modal show={openUpdateModal} size="md" onClose={onCloseUpdateModal} popup>
        <Modal.Header />
        <Modal.Body>
          <form action="" onSubmit={handleUpdateSubmit}>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Ders detaylarını seçin:</h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="DersID" value="Ders Adı Seçiniz" />
                </div>
                <Select name="DersID" onChange={(e) => setDers(e.target.value)} value={ders}>
                  <option disabled selected>Lütfen Ders Seçiniz</option>
                  {dersler.map((item) => (
                    <option key={item.DersID} value={item.DersID}>{item.DersAdi}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="HocaID" value="Hoca Adı Seçiniz" />
                </div>
                <Select name="HocaID" onChange={(e) => setHoca(e.target.value)} value={hoca}>
                  <option disabled selected>Lütfen Hoca Seçiniz</option>
                  {hocalar.map((item) => (
                    <option key={item.HocaID} value={item.HocaID}>{item.HocaAdi}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="SinifID" value="Sınıf Adı Seçiniz" />
                </div>
                <Select name="SinifID" onChange={(e) => setSinif(e.target.value)} value={sinif}>
                  <option disabled selected>Lütfen Sınıf Seçiniz</option>
                  {siniflar.map((item) => (
                    <option key={item.SinifID} value={item.SinifID}>{item.SinifAdi}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="Gun" value="Gun Seçiniz" />
                </div>
                <Select name="Gun" onChange={(e) => setGun(e.target.value)} value={gun}>
                  <option disabled selected>Lütfen Gün Seçiniz</option>
                  {gunler.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="Saat" value="Saat Seçiniz" />
                </div>
                <Select name="Saat" onChange={(e) => setSaat(e.target.value)} value={saat}>
                  <option disabled selected>Lütfen Saat Seçiniz</option>
                  {saatler.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </Select>
              </div>
              <div className="w-full flex justify-center">
                <button type="submit" className="w-full text-white bg-yellow">
                  Değiştir
                </button>
              </div>
              <div className="w-full flex justify-center">
                <button className="w-full text-white bg-yellow" onClick={handleDelete}>
                  SIL
                </button>
              </div>
            </div>
          </form>

        </Modal.Body>
      </Modal>
    </div >
  );
}

export default App;

