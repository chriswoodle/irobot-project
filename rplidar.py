import serial

##ser = serial.Serial('COM3', 115200, timeout=0)
'''Records measurments to a given file. Usage example:
$ ./record_measurments.py out.txt'''
import sys
from rplidar import RPLidar

PORT_NAME = '/dev/ttyUSB0'

def run(path):

    sector = 0
    s1 = 0.0
    s2 = 0.0
    s3 = 0.0
    s4 = 0.0

    i = 0

    s1sum = 0.0
    s2sum = 0.0
    s3sum = 0.0
    s4sum = 0.0

    ahead1 = 0.0
    a1 = 0.0
    ahead2 = 0.0
    a2 = 0.0
    ahead3 = 0.0
    a3 = 0.0

    '''Main function'''
    lidar = RPLidar(PORT_NAME)
    outfile = open(path, 'w')
    try:
        ##print('Recording measurements... Press Crl+C to stop.')
        for measurment in lidar.iter_measurments():
            i = i + 1
            line = '\t'.join(str(v) for v in measurment)
            if int(measurment[1]>0) :
                ##print ('valid reading')
                if float(measurment[2]) >= 315.0 and float(measurment[2]) < 335.0 :
                    ahead1 = ahead1 + float(measurment[3])
                    a1 = a1 + 1.0
                if float(measurment[2]) >= 335.0 or float(measurment[2]) < 20.0 :
                    ahead2 = ahead2 + float(measurment[3])
                    a2 = a2 + 1.0
                if float(measurment[2]) >= 20.0 and float(measurment[2]) < 45.0 :
                    ahead3 = ahead3 + float(measurment[3])
                    a3 = a3 + 1.0
                if float(measurment[2]) >= 315.0 or float(measurment[2]) < 45.0 :
                    sector = 1
                    s1sum = s1sum + float(measurment[3])
                    s1 = s1+ 1.0
                else :
                    if float(measurment[2]) >= 45.0 and float(measurment[2]) < 135.0 :
                        sector = 2
                        s2sum = s2sum + float(measurment[3])
                        s2 = s2+ 1.0
                    if float(measurment[2]) >= 135.0 and float(measurment[2]) < 225.0 :
                        sector = 3
                        s3sum = s3sum + float(measurment[3])
                        s3 = s3+ 1.0
                    if float(measurment[2]) >= 225.0 and float(measurment[2]) < 315.0 :
                        sector = 4
                        s4sum = s4sum + float(measurment[3])
                        s4 = s4+ 1.0
                ##print('angle is ' + str(measurment[2]) + " distance is " + str(measurment[3]) + " sector is " +str(sector))
                if i > 5000 and a1 > 0 and a2 > 0 and a3 > 0:
                    break
            ##outfile.write(line + '\n')
    except KeyboardInterrupt:
        print('Stopping.')

    s1avg = s1sum/s1
    s2avg = s2sum/s2
    s3avg = s3sum/s3
    s4avg = s4sum/s4

    a1av = ahead1/a1
    a2av = ahead2/a2
    a3av = ahead3/a3

    ##print (" averages ")
    print (str(s1avg) + " " + str(s2avg) + " " + str(s3avg) + " " + str(s4avg))

    ##print (" line detector averages ")
    print (str(a1av) + " " + str(a2av) + " " + str(a3av))

    lidar.stop()
    lidar.disconnect()

    outfile.write(str(s1avg) + " " + str(s2avg) + " " + str(s3avg) + " " + str(s4avg) + " " + str(a1av) + " " + str(a2av) + " " + str(a3av) + '\n')
    outfile.close()

if __name__ == '__main__':
    run(sys.argv[1])