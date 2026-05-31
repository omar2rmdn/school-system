import type { Request, Response } from "express";
import { Table } from "./model";
import { createTableSchema, updateTableSchema } from "./validation";

async function getAllTables(req: Request, res: Response) {
  const tables = await Table.find()
    .populate("class", "name")
    .populate("days.subject", "name")
    .select("-__v");
  return res.status(200).json({
    message: "tables sent successfully",
    data: {
      tables,
    },
  });
}

async function getOneTable(req: Request, res: Response) {
  const { id } = req.params;
  const table = await Table.findById(id)
    .populate("class", "name")
    .populate("days.subject", "name")
    .select("-__v");
  if (!table) {
    return res.status(404).json({
      message: "Table not found",
    });
  }
  return res.status(200).json({
    message: "table sent successfully",
    data: {
      table,
    },
  });
}

async function addTable(req: Request, res: Response) {
  const { error } = createTableSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const table = new Table(req.body);
  await table.save();

  return res.status(201).json({
    message: "table created successfully",
    data: {
      table: table.toObject(),
    },
  });
}

async function editTable(req: Request, res: Response) {
  const { error } = updateTableSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const { id } = req.params;
  const table = await Table.findById(id);
  if (!table) {
    return res.status(404).json({
      message: "Table not found",
    });
  }

  const updatedTable = await Table.findByIdAndUpdate(id, req.body, {
    new: true,
  })
    .populate("class", "name")
    .populate("days.subject", "name")
    .select("-__v");

  return res.status(200).json({
    message: "table updated successfully",
    data: {
      table: updatedTable,
    },
  });
}

async function deleteTable(req: Request, res: Response) {
  const { id } = req.params;
  const table = await Table.findByIdAndDelete(id);
  if (!table) {
    return res.status(404).json({
      message: "Table not found",
    });
  }
  return res.status(200).json({
    message: "table deleted successfully",
  });
}

export {
  getAllTables,
  getOneTable,
  addTable,
  editTable,
  deleteTable,
};