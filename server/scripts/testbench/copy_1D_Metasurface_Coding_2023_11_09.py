# -*- coding: utf-8 -*-
"""
Created on Sat Jun  3 00:36:16 2023

@author: saige

for incident angle		negaitve goes left from normal

for reflected angle		negative goes right from normal

"""

import numpy as np
import matplotlib.pyplot as plt
from scipy import integrate
import random

#input param
wavelength = 0.010706 #meters 

period = 0.0045 #meters

#number of unit cells

Nx = 10
Ny = 10
num_points = 100

#Phase shifts

#0123 28 GHz 
#phase_shifts = np.array([[0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi], [0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi], [0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi], [0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi], [0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi], [0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi], [0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi], [0, np.pi/2, np.pi, 3/2*np.pi, 0, np.pi/2, np.pi, 3/2*np.pi]])

#0011 28 GHz 
#phase_shifts = np.array([[0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi, 0, 0, np.pi, np.pi]])

#0000 28 GHz 
#phase_shifts = np.array([[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]])

#0011 3.5 GHz 
#phase_shifts = np.array([[0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi], [0, 0, np.pi, np.pi]])

#Random (still needs to be worked on)
rand_list = [0, np.pi]
phase_shifts = np.array([[random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)], 
                      [random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)], 
                      [random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)], 
                      [random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)], 
                      [random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)], 
                      [random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)], 
                      [random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)], 
                      [random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list), random.choice(rand_list)]])

#Pattern function

def pF(theta,phi): #pattern function f_e(theta,phi) is set to 1
    #initialize F to zero
    calF = 0
    #Calculate phase factor for each unit cell
    for i in range(8):
        for j in range(8):
            phase_factor = np.exp(-1j * (phase_shifts[i][j] + 2*np.pi/wavelength * period * 
                                          np.sin(theta) * ((i+1-1/2)*np.cos(phi) + (j+1-1/2)*np.sin(phi))))
            calF += phase_factor #add phase factor to F
    return calF

# def pF(theta,phi): #pattern function f_e(theta,phi) is set to 1
#     #initialize F to zero
#     calF = 0
#     #Calculate phase factor for each unit cell
#     for i in range(8):
#         for j in range(8):
#             phase_factor = np.exp(1j * (phase_shifts[j][i])) * np.exp(1j* 2*np.pi/wavelength * np.sin(theta) 
#                                                                       * ((period*(i+1)-1/2)*np.cos(phi) + period*((j+1)-1/2)*np.sin(phi)))
#             calF += phase_factor #add phase factor to F
#     return calF


#Directivity function

def Dir(theta,phi):
    F = pF(theta,phi)
    
    #numerator
    num = 4*np.pi*abs(F)**2
    
    #arrays for evaluating integrals
    theta_array = np.linspace(0, np.pi/2, num_points)
    phi_array = np.linspace(0, 2*np.pi, num_points)
    pF_array = pF(theta_array[:,np.newaxis], phi_array[np.newaxis,:])
    
    
    #Evaluate integral
    integral = np.trapz(
        np.trapz(np.abs(pF_array)**2 * np.sin(theta_array[:,np.newaxis]), 
                  theta_array), phi_array)
    
    
    #Evaluate integral
    # result= integrate.dblquad(abs(F)**2 * np.sin(theta), 0, 2*np.pi, 0, np.pi/2)
    
    #Compute directivity
    Dir = num/integral
    
    return Dir



theta_x = np.arange(-90,91)
Dir_array = []
pF_array = []

for i in theta_x:
          Dir_array.append((Dir(np.radians(i), np.radians(-90))))


for i in theta_x:
          Re_pF = pF(np.radians(i), np.radians(-90)).real
          Im_pF = pF(np.radians(i), np.radians(-90)).imag
          mag_pF = 20*np.log10(np.sqrt(Re_pF**2 + Im_pF**2))
          if mag_pF < -30:
              mag_pF = -30
          pF_array.append(mag_pF)
          
# max_Dir = max(Dir_array)
# print('Max: ', max_Dir)

# min_Dir = min(Dir_array)
# print('Min: ', min_Dir)

fig = plt.figure(figsize=(6, 3.2))

ax = fig.add_subplot(111)
ax.set_title('colorMap')
plt.imshow(phase_shifts)
ax.set_aspect('equal')

cax = fig.add_axes([0.12, 0.1, 0.78, 0.8])
cax.get_xaxis().set_visible(False)
cax.get_yaxis().set_visible(False)
cax.patch.set_alpha(0)
cax.set_frame_on(False)
plt.colorbar(orientation='vertical', ax = ax)

max_pF = max(pF_array)
print('Max pF: ', max_pF)
print('Max Reflection at angle(deg): ',theta_x[pF_array.index(max(pF_array))])

min_pF = min(pF_array)
print('Min pF: ', min_pF)
#print('Min index: ', pF_array.index(min(pF_array)))
print('Lowest reflected signal at at angle(deg): ',theta_x[pF_array.index(min(pF_array))])


        
# for i in theta_x:
#     Dir_array[i] = Dir_array[i] - max_Dir
plt.figure()
plt.plot(theta_x, pF_array)
plt.show()
    


    


