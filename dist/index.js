"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const parser_1 = require("./parser");
const allowedOrigins = ['http://localhost:3000', 'http://192.168.1.178:3000'];
const options = {
    origin: allowedOrigins,
};
const app = (0, express_1.default)();
// app.use(cors);
app.use((0, cors_1.default)(options));
const port = 8000;
app.get('/api/v1/rasp/:g/:p/:b/:r', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .status(200)
        .send(yield (0, parser_1.parseTimeTable)(`https://guap.ru/rasp/?g=${req.params.g}&p=${req.params.p}&b=${req.params.b}&r=${req.params.r}`));
}));
app.get('/api/v1/params', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(yield (0, parser_1.parseParams)('https://guap.ru/rasp/'));
}));
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
