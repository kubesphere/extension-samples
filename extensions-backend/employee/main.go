package main

import (
	"github.com/gin-gonic/gin"
	"kubesphere.io/employee/models"
	"log"
	"net/http"
	"strconv"
)

func main() {
	err := models.ConnectDatabase()
	checkErr(err)

	r := gin.Default()

	v1 := r.Group("/kapis/employee.kubesphere.io/v1alpha1")
	{
		v1.GET("/employees", getEmployees)
		v1.GET("/employee/:id", getEmployee)
		v1.POST("/employee", createEmployee)
		v1.PUT("/employee/:id", updateEmployee)
		v1.DELETE("/employee/:id", deleteEmployee)
		v1.OPTIONS("/employee", optionsEmployee)
	}

	r.GET("/healthz", healthz)

	r.Run()
}

func getEmployees(c *gin.Context) {
	isDelete := c.Query("deleted")
	employees, err := models.GetEmployees(10, isDelete)

	checkErr(err)

	count, _ := models.GetEmployeeCount(isDelete)

	if employees == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No employee found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"items": employees, "totalItems": count})
	}
}

func getEmployee(c *gin.Context) {
	id := c.Param("id")
	employee, err := models.GetEmployeeById(id)
	checkErr(err)

	if employee.Name == "" {
		c.JSON(http.StatusNotFound, gin.H{"message": "No employee found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": employee})
}

func createEmployee(c *gin.Context) {
	var json models.Employee

	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	success, err := models.CreateEmployee(json)

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func updateEmployee(c *gin.Context) {
	var json models.Employee

	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
	}

	success, err := models.UpdateEmployee(json, id)

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func deleteEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
	}

	success, err := models.DeleteEmployee(id)

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func optionsEmployee(c *gin.Context) {
	ourOptions := "HTTP/1.1 200 OK\n" +
		"Allow: GET,POST,PUT,DELETE,OPTIONS\n" +
		"Access-Control-Allow-Origin: http://locahost:8080\n" +
		"Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS\n" +
		"Access-Control-Allow-Headers: Content-Type\n"

	c.String(200, ourOptions)
}

func healthz(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Success"})
}

func checkErr(err error) {
	if err != nil {
		log.Print(err)
	}
}
