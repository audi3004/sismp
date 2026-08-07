import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { dbConfig } from "./config.js";

// Setup Sequelize connection targeting MariaDB/MySQL database as per config
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    logging: dbConfig.logging,
  }
);

// User model structure representing general user fields
export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "User",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Unit model structure representing standard PLN work units
export const Unit = sequelize.define(
  "Unit",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    kdUnit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    namaUnit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamatUnit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idInduk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idUnit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kodeFin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    distribusi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    singkatanUnit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    areaFin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    noProjectFin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unitFin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    areaSimponi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    groupTraccar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unitOrg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kodeCash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "units",
    timestamps: true,
  }
);

// Petugas model structure representing officers / field technicians
export const Petugas = sequelize.define(
  "Petugas",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nipeg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    migrateFs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mulaiAktifShift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    akhirAktifShift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "petugas",
    timestamps: true,
  }
);

// PerformaPetugas model structure representing performance of field officers / technicians
export const PerformaPetugas = sequelize.define(
  "PerformaPetugas",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nipeg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idUnit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thbl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    periode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hariKerja: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jmlJamMasuk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    skorPerforma: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    skorProduktivitas: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    skorHariKerja: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jmlTilang: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "performa_petugas",
    timestamps: true,
  }
);

// Automatic seeder function to guarantee of Admin user with password Admin@123
export async function seedAdmin() {
  try {
    const existing = await User.findOne({ where: { username: "Admin" } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await User.create({
        username: "Admin",
        password: hashedPassword,
        name: "Administrator SisMP",
        email: "admin@sismp.local",
        role: "Admin",
      });
      console.log("✔ Default Admin seeded successfully (Username: Admin, Password: Admin@123)");
    } else {
      console.log("ℹ Admin user already exists. Seeding skipped.");
    }
  } catch (err) {
    console.error("⚠ Warning: Failed to seed Admin: ", err.message);
  }
}

export default {
  sequelize,
  User,
  Unit,
  Petugas,
  PerformaPetugas,
  seedAdmin,
};
