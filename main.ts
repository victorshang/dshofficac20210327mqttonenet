function playSound (value: number) {
    if (!(Silence)) {
        music.playTone(value, music.beat(BeatFraction.Sixteenth))
    }
}
function ErrorHandle (isOK: boolean, OutputErrorInfo: string) {
    if (!(isOK)) {
        I2C_LCD1602.ShowString(OutputErrorInfo, 0, 0)
        basic.pause(2000)
        music.playTone(196, music.beat(BeatFraction.Sixteenth))
        control.reset()
    }
}
input.onButtonPressed(Button.A, function () {
    meideaAC_ir.initIR(AnalogPin.P8)
    basic.pause(500)
    meideaAC_ir.sendCode(meideaAC_ir.getOpenCode(mode_code.Wind, tmp_code.T25, wind_code.Auto))
})
function turnSilence () {
    Silence = !(Silence)
    if (Silence) {
        I2C_LCD1602.BacklightOff()
    } else {
        I2C_LCD1602.BacklightOn()
    }
}
input.onButtonPressed(Button.AB, function () {
    turnSilence()
})
function Login () {
    mqtt_4_esp01.set_io(
    SerialPin.P2,
    SerialPin.P1,
    BaudRate.BaudRate115200
    )
    mqtt_4_esp01.init_esp01(
    "Redmi_Mini",
    "0987654323",
    "mqtt.heclouds.com",
    6002
    )
    basic.showString("W")
    basic.pause(5000)
    mqtt_4_esp01.init_MQTT_info(
    "699724857",
    "408028",
    "a000002"
    )
    while (!(mqtt_4_esp01.send_MQTT_connect(2))) {
        basic.showString("" + (mqtt_4_esp01.connectack_code(
        )))
        basic.pause(5000)
    }
    basic.showString("L")
    basic.pause(1000)
    mqtt_4_esp01.set_MQTT_SubTopic(
    TOPIC_CLASS.Topic1,
    "autoac/001"
    )
    while (!(mqtt_4_esp01.send_MQTT_subTopic(TOPIC_CLASS.Topic1, 2))) {
        basic.pause(5000)
    }
    basic.showString("S")
    basic.pause(1000)
    lasttime = control.millis()
}
function showHeart () {
    if (!(Silence)) {
        basic.showIcon(IconNames.Heart)
        basic.clearScreen()
    }
}
function initLCD1602 () {
    I2C_LCD1602.LcdInit(39)
    for (let index = 0; index < 3; index++) {
        I2C_LCD1602.BacklightOff()
        basic.pause(200)
        I2C_LCD1602.BacklightOn()
        basic.pause(200)
    }
    I2C_LCD1602.ShowString("**My AC Ctrl**", 0, 0)
    I2C_LCD1602.ShowString("*****V1.0******", 0, 1)
    for (let index = 0; index < 16; index++) {
        I2C_LCD1602.shr()
        basic.pause(200)
    }
    I2C_LCD1602.clear()
}
function run_cmd (_cmd: string) {
    命令 = _cmd
    ShowText1602(命令)
    if (命令 == "onHotAC") {
        playSound(523)
        basic.pause(500)
        meideaAC_ir.initIR(AnalogPin.P8)
        basic.pause(500)
        for (let index = 0; index < 3; index++) {
            meideaAC_ir.sendCode(meideaAC_ir.getOpenCode(mode_code.Heat, tmp_code.T22, wind_code.Mid))
            basic.pause(2000)
        }
    } else if (命令 == "onColdAC") {
        playSound(523)
        basic.pause(500)
        meideaAC_ir.initIR(AnalogPin.P8)
        basic.pause(500)
        for (let index = 0; index < 3; index++) {
            meideaAC_ir.sendCode(meideaAC_ir.getOpenCode(mode_code.Cold, tmp_code.T25, wind_code.Mid))
            basic.pause(2000)
        }
    } else if (命令 == "shakeHead") {
        playSound(523)
        basic.pause(500)
        meideaFan_ir.initIR(AnalogPin.P8)
        basic.pause(500)
        meideaFan_ir.sendCode(meideaFan_ir.getFanMode(fanCode_code.fan_ShakeHead))
    } else if (命令 == "onOffFan") {
        playSound(523)
        basic.pause(500)
        meideaFan_ir.initIR(AnalogPin.P8)
        basic.pause(500)
        meideaFan_ir.sendCode(meideaFan_ir.getFanMode(fanCode_code.fan_OpenClose))
    } else if (命令 == "turnSilence") {
        playSound(196)
        turnSilence()
    } else if (命令 == "playMusic") {
        music.playTone(262, music.beat(BeatFraction.Whole))
    } else if (命令 == "reset") {
        playSound(196)
        control.reset()
    } else if (命令 == "ERROR") {
        playSound(196)
        control.reset()
    } else if (命令 == "offAC") {
        playSound(523)
        basic.pause(500)
        meideaAC_ir.initIR(AnalogPin.P8)
        basic.pause(500)
        for (let index = 0; index < 3; index++) {
            meideaAC_ir.sendCode(meideaAC_ir.getCloseCode())
            basic.pause(2000)
        }
    } else {
    	
    }
}
function initVar () {
    Silence = false
    sleeptime = 10000
    beat = 0
    lasttime = control.millis()
    music.playTone(523, music.beat(BeatFraction.Sixteenth))
}
function initOther () {
    basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        . . . . .
        `)
    basic.pause(500)
}
input.onButtonPressed(Button.B, function () {
    meideaAC_ir.initIR(AnalogPin.P8)
    basic.pause(500)
    meideaAC_ir.sendCode(meideaAC_ir.getCloseCode())
})
function showDiamond () {
    if (!(Silence)) {
        basic.showIcon(IconNames.Square)
        basic.clearScreen()
    }
}
mqtt_4_esp01.onEventSerialData(TOPIC_CLASS.Topic1, function (data) {
    ShowText1602(data)
    if (data.split(":")[0] == "cmd") {
        run_cmd(data.split(":")[1])
    }
})
mqtt_4_esp01.onEventSerialCMD(function (cmd_uuid, data) {
    run_cmd(data)
    mqtt_4_esp01.send_MQTT_public(
    mqtt_4_esp01.get_Info_by_OneNet_CMD(
    cmd_uuid,
    "OK"
    )
    )
})
function ShowText1602 (text: string) {
    I2C_LCD1602.clear()
    local_len = text.length
    if (local_len <= 16) {
        I2C_LCD1602.ShowString(text, Math.round((16 - local_len) / 2), 0)
    } else {
        I2C_LCD1602.ShowString(text.substr(0, 16), 0, 0)
        I2C_LCD1602.ShowString(text.substr(16, 16), 0, 1)
    }
}
let local_len = 0
let beat = 0
let sleeptime = 0
let 命令 = ""
let lasttime = 0
let Silence = false
initVar()
initOther()
initLCD1602()
Login()
basic.forever(function () {
    if (control.millis() - lasttime > sleeptime) {
        if (mqtt_4_esp01.send_MQTT_ping(2)) {
            showHeart()
            beat += 1
            lasttime = control.millis()
        } else {
            Login()
        }
    }
    if (beat >= 6) {
        basic.pause(1000)
        mqtt_4_esp01.send_MQTT_public(
        mqtt_4_esp01.get_Info_by_str("autoac/002", "Temp:" + convertToText(input.temperature()))
        )
        basic.pause(200)
        mqtt_4_esp01.send_MQTT_public(
        mqtt_4_esp01.get_Info_by_OneNetType3_num(
        "test",
        input.temperature()
        )
        )
        ShowText1602("Temp:" + convertToText(input.temperature()))
        showDiamond()
        beat = 0
    }
})
